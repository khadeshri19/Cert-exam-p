"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const db_1 = require("../config/db");
const create = async (req, res) => {
    const session = await db_1.pool.query("INSERT INTO canva_sessions (name,owner_id) VALUES ($1,$2) RETURNING *", [req.body.name, req.user.id]);
    res.json(session.rows[0]);
};
exports.create = create;
const getAll = async (_, res) => {
    const data = await db_1.pool.query("SELECT * FROM canva_sessions");
    res.json(data.rows);
};
exports.getAll = getAll;
const getOne = async (req, res) => {
    const data = await db_1.pool.query("SELECT * FROM canva_sessions WHERE id=$1", [req.params.id]);
    res.json(data.rows[0]);
};
exports.getOne = getOne;
const update = async (req, res) => {
    await db_1.pool.query("UPDATE canva_sessions SET name=$1 WHERE id=$2", [req.body.name, req.params.id]);
    res.json({ message: "Updated" });
};
exports.update = update;
const remove = async (req, res) => {
    await db_1.pool.query("DELETE FROM canva_sessions WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
};
exports.remove = remove;
