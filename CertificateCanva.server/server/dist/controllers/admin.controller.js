"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const createUser = async (req, res) => {
    const { email, password, role } = req.body;
    const hash = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.pool.query("INSERT INTO users (email,password,role) VALUES ($1,$2,$3) RETURNING *", [email, hash, role]);
    res.json(user.rows[0]);
};
exports.createUser = createUser;
const getUsers = async (_, res) => {
    const users = await db_1.pool.query("SELECT id,email,role FROM users");
    res.json(users.rows);
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    const user = await db_1.pool.query("SELECT id,email,role FROM users WHERE id=$1", [
        req.params.id,
    ]);
    res.json(user.rows[0]);
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    await db_1.pool.query("UPDATE users SET role=$1 WHERE id=$2", [
        req.body.role,
        req.params.id,
    ]);
    res.json({ message: "Updated" });
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    await db_1.pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
};
exports.deleteUser = deleteUser;
