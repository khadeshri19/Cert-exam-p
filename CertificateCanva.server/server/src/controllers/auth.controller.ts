import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (!user.rows.length) return res.status(401).json({ message: "Invalid" });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(401).json({ message: "Invalid" });

  const accessToken = jwt.sign(
    { id: user.rows[0].id, role: user.rows[0].role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.rows[0].id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES ($1,$2)",
    [user.rows[0].id, refreshToken]
  );

  res.json({ accessToken, refreshToken });
};

export const refresh = async (req: Request, res: Response) => {
  const { token } = req.body;

  const stored = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token=$1",
    [token]
  );
  if (!stored.rows.length) return res.sendStatus(403);

  const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

  const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

  res.json({ accessToken: newAccessToken });
};

export const logout = async (req: any, res: Response) => {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [
    req.user.id,
  ]);
  res.json({ message: "Logged out" });
};

export const getUser = async (req: Request, res: Response) => {
  const user = await pool.query("SELECT id,email,role FROM users WHERE id=$1", [
    req.params.id,
  ]);
  res.json(user.rows[0]);
};
