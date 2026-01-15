import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import imageRoutes from "./routes/images.routes";
import canvaRoutes from "./routes/canvas.routes";
import verificationRoutes from "./routes/verification.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/canvas", canvaRoutes);
app.use("/api", verificationRoutes);

export default app;
