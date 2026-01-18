import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();


router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authMiddleware, controller.logout);
router.get("/users/:id", authMiddleware, controller.getUser);

export default router;
