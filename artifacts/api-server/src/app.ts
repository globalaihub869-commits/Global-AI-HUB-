import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { inspectRequest, isBlocked } from "./lib/threat-store.js";

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
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
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
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
