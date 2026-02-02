import { pool } from '../config/db';

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.username, u.password_hash, u.is_active, r.role_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0];
};

export const findUserById = async (id: string) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.username, u.is_active, u.role_id, r.role_name, u.created_at, u.updated_at
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const saveRefreshToken = async (userId: string, token: string) => {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, token]
  );
};

export const findRefreshToken = async (token: string) => {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens 
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );
  return result.rows[0];
};

export const deleteRefreshTokensByUser = async (userId: string) => {
  await pool.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );
};

export const deleteRefreshToken = async (token: string) => {
  await pool.query(
    `DELETE FROM refresh_tokens WHERE token = $1`,
    [token]
  );
};

export const cleanExpiredTokens = async () => {
  await pool.query(
    `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
  );
};
