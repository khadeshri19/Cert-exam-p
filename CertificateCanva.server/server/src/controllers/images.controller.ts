import { Request, Response } from "express";
import { pool } from "../config/db";

export const upload = async (req: any, res: Response) => {
  const img = await pool.query(
    "INSERT INTO images (url,user_id) VALUES ($1,$2) RETURNING *",
    [req.file.path, req.user.id]
  );
  res.json(img.rows[0]);
};

export const getAll = async (_: Request, res: Response) => {
  const imgs = await pool.query("SELECT * FROM images");
  res.json(imgs.rows);
};

export const getOne = async (req: Request, res: Response) => {
  const img = await pool.query("SELECT * FROM images WHERE id=$1", [
    req.params.id,
  ]);
  res.json(img.rows[0]);
};

export const remove = async (req: Request, res: Response) => {
  await pool.query("DELETE FROM images WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
};
