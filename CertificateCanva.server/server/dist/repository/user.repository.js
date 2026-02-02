"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Create user (by Admin)
 */
const createUser = async (data) => {
    const { name, email, username, password_hash, role_id } = data;
    const { rows } = await db_1.default.query(`
    INSERT INTO users (name, email, username, password_hash, role_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, username, role_id, is_active, created_at
    `, [name, email, username, password_hash, role_id]);
    return rows[0];
};
exports.createUser = createUser;
/**
 * Get all users
 */
const getAllUsers = async () => {
    const { rows } = await db_1.default.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.username,
      r.role_name AS role,
      u.is_active,
      u.created_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    ORDER BY u.created_at DESC
    `);
    return rows;
};
exports.getAllUsers = getAllUsers;
/**
 * Get user by ID
 */
const getUserById = async (id) => {
    const { rows } = await db_1.default.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.username,
      r.role_name AS role,
      u.is_active,
      u.created_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
    `, [id]);
    return rows[0];
};
exports.getUserById = getUserById;
/**
 * Update user by ID (Admin)
 */
const updateUserById = async (id, data) => {
    const fields = [];
    const values = [];
    let index = 1;
    for (const key in data) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
    }
    if (!fields.length)
        return null;
    const { rows } = await db_1.default.query(`
    UPDATE users
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING id, name, email, username, role_id, is_active, updated_at
    `, [...values, id]);
    return rows[0];
};
exports.updateUserById = updateUserById;
/**
 * Delete user (Hard delete)
 */
const deleteUserById = async (id) => {
    await db_1.default.query(`DELETE FROM users WHERE id = $1`, [id]);
};
exports.deleteUserById = deleteUserById;
//# sourceMappingURL=user.repository.js.map