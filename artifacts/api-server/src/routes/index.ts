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

export default router;
