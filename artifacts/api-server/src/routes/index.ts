import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import toolsRouter from "./tools.js";
import newsRouter from "./news.js";
import authRouter from "./auth.js";
import jobsRouter from "./jobs.js";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(toolsRouter);
router.use(newsRouter);
router.use(jobsRouter);

export default router;
