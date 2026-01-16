"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.logout = exports.refresh = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const login = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            message: "Request body missing or invalid JSON",
        });
    }
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }
    const user = await db_1.pool.query("SELECT * FROM users WHERE email=$1", [email]);
    console.log("Fetched user : ", user);
    if (!user.rows.length) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("Valid user fetched", user.rows[0]);
    const valid = bcryptjs_1.default.compare(password, user.rows[0].password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const accessToken = jsonwebtoken_1.default.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.rows[0].id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    await db_1.pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1,$2)", [user.rows[0].id, refreshToken]);
    res.json({ accessToken, refreshToken });
};
exports.login = login;
const refresh = async (req, res) => {
    const { token } = req.body;
    const stored = await db_1.pool.query("SELECT * FROM refresh_tokens WHERE token=$1", [token]);
    if (!stored.rows.length)
        return res.sendStatus(403);
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
    res.json({ accessToken: newAccessToken });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    await db_1.pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [
        req.user.id,
    ]);
    res.json({ message: "Logged out" });
};
exports.logout = logout;
const getUser = async (req, res) => {
    const user = await db_1.pool.query("SELECT id,email,role FROM users WHERE id=$1", [
        req.params.id,
    ]);
    res.json(user.rows[0]);
};
exports.getUser = getUser;
