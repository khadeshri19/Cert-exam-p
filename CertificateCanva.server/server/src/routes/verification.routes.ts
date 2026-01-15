import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { pool } from "../config/db";

const router = Router();

router.get("/authorized/:id", authMiddleware, async (req: any, res) => {
  const result = await pool.query(
    "SELECT * FROM canva_sessions WHERE id=$1 AND owner_id=$2",
    [req.params.id, req.user.id]
  );

  res.json({ authorized: result.rows.length > 0 });
});

export default router;
