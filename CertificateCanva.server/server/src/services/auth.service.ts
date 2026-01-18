import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

export const login = async ({ email, password }: any) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const result = await pool.query(
    `SELECT u.id, u.email, u.password_hash, r.role_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1`,
    [email]
  );

  if (!result.rows.length) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role_name },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, now() + interval '7 days')`,
    [user.id, refreshToken]
  );

  return { accessToken, refreshToken };
};

export const refresh = async (token: string) => {
  if (!token) throw new Error("Token missing");

  const stored = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token=$1",
    [token]
  );

  if (!stored.rows.length) throw new Error("Forbidden");

  const decoded: any = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!
  );

  return jwt.sign(
    { id: decoded.id },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );
};

export const logout = async (userId: string) => {
  await pool.query(
    "DELETE FROM refresh_tokens WHERE user_id=$1",
    [userId]
  );
};

export const getUser = async (id: string) => {
  const result = await pool.query(
    `SELECT id, email, username, is_active
     FROM users WHERE id=$1`,
    [id]
  );
  return result.rows[0];
};
