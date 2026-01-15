import { Request, Response } from "express";
import { pool } from "../config/db";

export const create = async (req: any, res: Response) => {
  const session = await pool.query(
    "INSERT INTO canva_sessions (name,owner_id) VALUES ($1,$2) RETURNING *",
    [req.body.name, req.user.id]
  );
  res.json(session.rows[0]);
};

export const getAll = async (_: Request, res: Response) => {
  const data = await pool.query("SELECT * FROM canva_sessions");
  res.json(data.rows);
};

export const getOne = async (req: Request, res: Response) => {
  const data = await pool.query(
    "SELECT * FROM canva_sessions WHERE id=$1",
    [req.params.id]
  );
  res.json(data.rows[0]);
};

export const update = async (req: Request, res: Response) => {
  await pool.query(
    "UPDATE canva_sessions SET name=$1 WHERE id=$2",
    [req.body.name, req.params.id]
  );
  res.json({ message: "Updated" });
};

export const remove = async (req: Request, res: Response) => {
  await pool.query(
    "DELETE FROM canva_sessions WHERE id=$1",
    [req.params.id]
  );
  res.json({ message: "Deleted" });
};
