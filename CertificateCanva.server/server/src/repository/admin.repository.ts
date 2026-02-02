import pool from '../config/db';

export interface CreateUserData {
  name: string;
  email: string;
  username: string;
  password_hash: string;
  role_id: number;
}

export const createUser = async (data: CreateUserData) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, username, password_hash, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, username, role_id, is_active, created_at, updated_at`,
    [data.name, data.email, data.username, data.password_hash, data.role_id]
  );
  return rows[0];
};

export const getUsers = async () => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.username, u.role_id, r.role_name, u.is_active, u.created_at, u.updated_at
     FROM users u
     JOIN roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC`
  );
  return rows;
};

export const getUserById = async (id: string) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.username, u.role_id, r.role_name, u.is_active, u.created_at, u.updated_at
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [id]
  );
  return rows[0];
};

export const updateUser = async (id: string, data: Partial<Omit<CreateUserData, 'password_hash'> & { password_hash?: string, is_active?: boolean }>) => {
  const allowedFields = ['name', 'email', 'username', 'password_hash', 'role_id', 'is_active'];
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  values.push(id);

  const { rows } = await pool.query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${index}
     RETURNING id, name, email, username, role_id, is_active, created_at, updated_at`,
    values
  );

  return rows[0];
};

export const deleteUser = async (id: string) => {
  const { rowCount } = await pool.query(
    `DELETE FROM users WHERE id = $1`,
    [id]
  );
  return rowCount && rowCount > 0;
};

export const checkEmailExists = async (email: string, excludeId?: string) => {
  let query = 'SELECT id FROM users WHERE email = $1';
  const params: any[] = [email];

  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }

  const { rows } = await pool.query(query, params);
  return rows.length > 0;
};

export const checkUsernameExists = async (username: string, excludeId?: string) => {
  let query = 'SELECT id FROM users WHERE username = $1';
  const params: any[] = [username];

  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }

  const { rows } = await pool.query(query, params);
  return rows.length > 0;
};
