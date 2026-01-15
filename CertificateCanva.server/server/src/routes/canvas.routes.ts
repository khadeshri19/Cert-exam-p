import { Router } from "express";
import * as controller from "../controllers/canvas.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/session", authMiddleware, controller.create);
router.get("/session", authMiddleware, controller.getAll);
router.get("/session/:id", authMiddleware, controller.getOne);
router.patch("/session/:id", authMiddleware, controller.update);
router.delete("/session/:id", authMiddleware, controller.remove);

export default router;
