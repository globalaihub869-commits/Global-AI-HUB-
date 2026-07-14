import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { inspectRequest, isBlocked, isIpTrusted } from "./lib/threat-store.js";
import { recordRequest } from "./lib/request-stats.js";

const app: Express = express();

// Trust the platform's reverse proxy so req.ip reflects the real client IP
// (from X-Forwarded-For) instead of the shared proxy's local address. This
// matters for the threat defense system below, which blocks by IP.
app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["X-Security-Warning"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";

  // Whitelisted admin IPs and the admin-override endpoint always bypass all
  // security checks — this is the "Admin Override" backup mechanism that lets
  // the site owner log in even if their IP was auto-blocked.
  const isOverridePath = req.path === "/api/auth/admin-override";
  if (isOverridePath || isIpTrusted(ip)) {
    next();
    return;
  }

  if (isBlocked(ip)) {
    res.status(403).json({ error: "ACCESS_BLOCKED", message: "This IP has been automatically blocked by the threat defense system" });
    return;
  }
  const threat = inspectRequest({
    ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers["user-agent"],
  });
  if (threat) {
    if (threat.preBlockWarning) {
      // Strict pre-block warning: surface it to the offending client via a
      // response header (read by the frontend to show a warning banner) but
      // let the request through — the hard block only kicks in once the
      // warning limit is exceeded (see threat-store.ts).
      res.setHeader("X-Security-Warning", JSON.stringify({ reason: threat.reason, attemptNumber: threat.attemptNumber }));
      next();
      return;
    }
    res.status(403).json({ error: "ACCESS_BLOCKED", message: "Blocked by automated threat defense", reason: threat.reason });
    return;
  }
  next();
});

const sessionSecret = process.env["SESSION_SECRET"];
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.use(
  session({
    secret: sessionSecret,
    name: "ghub.sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

// Record every completed request for the real-time traffic stats.
// Must be registered before the router so the "finish" listener is always attached.
app.use((_req, res, next) => {
  res.on("finish", () => {
    recordRequest(res.statusCode >= 500);
  });
  next();
});

app.use("/api", router);

// Catch-all JSON error handler — must have 4 params so Express recognises it
// as an error handler. Converts any unhandled throw (including async route
// errors like DB "relation does not exist") into a consistent JSON response
// instead of Express's default HTML error page.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status =
    (err as { status?: number }).status ??
    (err as { statusCode?: number }).statusCode ??
    500;
  const message =
    err instanceof Error ? err.message : "Internal server error";
  logger.error({ err, status }, "Unhandled route error");
  res.status(status).json({ error: "SERVER_ERROR", message });
};

app.use(errorHandler);

export default app;
