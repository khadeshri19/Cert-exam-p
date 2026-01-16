"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.getOne = exports.getAll = exports.upload = void 0;
const db_1 = require("../config/db");
const upload = async (req, res) => {
    const img = await db_1.pool.query("INSERT INTO images (url,user_id) VALUES ($1,$2) RETURNING *", [req.file.path, req.user.id]);
    res.json(img.rows[0]);
};
exports.upload = upload;
const getAll = async (_, res) => {
    const imgs = await db_1.pool.query("SELECT * FROM images");
    res.json(imgs.rows);
};
exports.getAll = getAll;
const getOne = async (req, res) => {
    const img = await db_1.pool.query("SELECT * FROM images WHERE id=$1", [
        req.params.id,
    ]);
    res.json(img.rows[0]);
};
exports.getOne = getOne;
const remove = async (req, res) => {
    await db_1.pool.query("DELETE FROM images WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
};
exports.remove = remove;
