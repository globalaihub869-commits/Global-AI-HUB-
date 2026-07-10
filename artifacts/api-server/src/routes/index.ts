import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import toolsRouter from "./tools.js";
import newsRouter from "./news.js";
import authRouter from "./auth.js";
import jobsRouter from "./jobs.js";
import socialRouter from "./social.js";
import billingRouter from "./billing.js";
import marketplaceRouter from "./marketplace.js";
import gigsRouter from "./gigs.js";
import playgroundRouter from "./playground.js";
import securityRouter from "./security.js";
import referralsRouter from "./referrals.js";
import analyticsRouter from "./analytics.js";
import supportRouter from "./support.js";
import vipRouter from "./vip.js";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(toolsRouter);
router.use(newsRouter);
router.use(jobsRouter);
router.use(socialRouter);
router.use(billingRouter);
router.use(marketplaceRouter);
router.use(gigsRouter);
router.use(playgroundRouter);
router.use(securityRouter);
router.use(referralsRouter);
router.use(analyticsRouter);
router.use(supportRouter);
router.use("/vip", vipRouter);

export default router;
