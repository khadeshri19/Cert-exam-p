"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanExpiredTokens = exports.deleteRefreshToken = exports.deleteRefreshTokensByUser = exports.findRefreshToken = exports.saveRefreshToken = exports.findUserById = exports.findUserByEmail = void 0;
const db_1 = require("../config/db");
const findUserByEmail = async (email) => {
    const result = await db_1.pool.query(`SELECT u.id, u.name, u.email, u.username, u.password_hash, u.is_active, r.role_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1`, [email]);
    return result.rows[0];
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    const result = await db_1.pool.query(`SELECT u.id, u.name, u.email, u.username, u.is_active, u.role_id, r.role_name, u.created_at, u.updated_at
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`, [id]);
    return result.rows[0];
};
exports.findUserById = findUserById;
const saveRefreshToken = async (userId, token) => {
    await db_1.pool.query(`INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`, [userId, token]);
};
exports.saveRefreshToken = saveRefreshToken;
const findRefreshToken = async (token) => {
    const result = await db_1.pool.query(`SELECT * FROM refresh_tokens 
     WHERE token = $1 AND expires_at > NOW()`, [token]);
    return result.rows[0];
};
exports.findRefreshToken = findRefreshToken;
const deleteRefreshTokensByUser = async (userId) => {
    await db_1.pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
};
exports.deleteRefreshTokensByUser = deleteRefreshTokensByUser;
const deleteRefreshToken = async (token) => {
    await db_1.pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
};
exports.deleteRefreshToken = deleteRefreshToken;
const cleanExpiredTokens = async () => {
    await db_1.pool.query(`DELETE FROM refresh_tokens WHERE expires_at < NOW()`);
};
exports.cleanExpiredTokens = cleanExpiredTokens;
//# sourceMappingURL=auth.repository.js.map