import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studiosRouter from "./studios";
import classesRouter from "./classes";
import bookingsRouter from "./bookings";
import feedRouter from "./feed";
import forumRouter from "./forum";
import productsRouter from "./products";
import authRouter from "./auth";
import uploadsRouter from "./uploads";
import paymentsRouter from "./payments";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studiosRouter);
router.use(classesRouter);
router.use(bookingsRouter);
router.use(feedRouter);
router.use(forumRouter);
router.use(productsRouter);
router.use(authRouter);
router.use("/uploads", uploadsRouter);
router.use("/payments", paymentsRouter);
router.use(messagesRouter);

export default router;
