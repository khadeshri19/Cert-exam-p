import { Router } from "express";
import multer from "multer";
import * as controller from "../controllers/images.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.post("/", authMiddleware, upload.single("image"), controller.upload);
router.get("/", authMiddleware, controller.getAll);
router.get("/:id", authMiddleware, controller.getOne);
router.delete("/:id", authMiddleware, controller.remove);

export default router;
