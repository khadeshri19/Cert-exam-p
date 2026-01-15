import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";

export const createUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const user = await pool.query(
    "INSERT INTO users (email,password,role) VALUES ($1,$2,$3) RETURNING *",
    [email, hash, role]
  );

  res.json(user.rows[0]);
};

export const getUsers = async (_: Request, res: Response) => {
  const users = await pool.query("SELECT id,email,role FROM users");
  res.json(users.rows);
};

export const getUser = async (req: Request, res: Response) => {
  const user = await pool.query("SELECT id,email,role FROM users WHERE id=$1", [
    req.params.id,
  ]);
  res.json(user.rows[0]);
};

export const updateUser = async (req: Request, res: Response) => {
  await pool.query("UPDATE users SET role=$1 WHERE id=$2", [
    req.body.role,
    req.params.id,
  ]);
  res.json({ message: "Updated" });
};

export const deleteUser = async (req: Request, res: Response) => {
  await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
};
