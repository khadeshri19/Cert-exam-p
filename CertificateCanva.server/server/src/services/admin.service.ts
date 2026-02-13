import pool from '../config/db';
import { hashPassword } from '../utils/hash';
import { HttpError } from '../middlewares/error.middleware';

// Allowed admin email domains
const ADMIN_DOMAINS = ['sarvarth.com', 'google.com'];

// Validate admin email domain
export const validateAdminDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return ADMIN_DOMAINS.includes(domain);
};

// Create user (admin only)
export const createUser = async (data: {
  name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
}) => {
  const { name, username, email, password, role_id } = data;

  if (role_id === 1) {
    if (!validateAdminDomain(email)) {
      throw new HttpError(
        `Admin users must have email from: ${ADMIN_DOMAINS.join(' or ')}`,
        400
      );
    }
  }

  const existingEmail = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existingEmail.rows.length > 0) {
    throw new HttpError('Email already exists', 409);
  }

  const existingUsername = await pool.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  if (existingUsername.rows.length > 0) {
    throw new HttpError('Username already exists', 409);
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (name, username, email, password_hash, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, username, email, role_id, is_active, created_at`,
    [name, username, email, passwordHash, role_id]
  );

  return result.rows[0];
};

// Get all users
export const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT u.id, u.name, u.username, u.email, u.role_id, r.role_name, u.is_active, u.created_at, u.updated_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `);
  return result.rows;
};

// Get user by ID
export const getUserById = async (id: string) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.username, u.email, u.role_id, r.role_name, u.is_active, u.created_at, u.updated_at
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new HttpError('User not found', 404);
  }

  return result.rows[0];
};

// Update user
export const updateUser = async (
  id: string,
  data: {
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    role_id?: number;
    is_active?: boolean;
  }
) => {
  const user = await getUserById(id);

  if (data.role_id === 1) {
    const emailToCheck = data.email || user.email;
    if (!validateAdminDomain(emailToCheck)) {
      throw new HttpError(
        `Admin users must have email from: ${ADMIN_DOMAINS.join(' or ')}`,
        400
      );
    }
  }

  if (data.email && data.email !== user.email) {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [data.email, id]
    );
    if (existing.rows.length > 0) {
      throw new HttpError('Email already exists', 409);
    }
  }

  if (data.username && data.username !== user.username) {
    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [data.username, id]
    );
    if (existing.rows.length > 0) {
      throw new HttpError('Username already exists', 409);
    }
  }

  let passwordHash = user.password_hash;
  if (data.password) {
    passwordHash = await hashPassword(data.password);
  }

  const result = await pool.query(
    `UPDATE users SET
      name = COALESCE($1, name),
      username = COALESCE($2, username),
      email = COALESCE($3, email),
      password_hash = $4,
      role_id = COALESCE($5, role_id),
      is_active = COALESCE($6, is_active),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING id, name, username, email, role_id, is_active, updated_at`,
    [
      data.name,
      data.username,
      data.email,
      passwordHash,
      data.role_id,
      data.is_active,
      id,
    ]
  );

  return result.rows[0];
};

// Delete user
export const deleteUser = async (id: string, adminId: string) => {
  if (id === adminId) {
    throw new HttpError('Cannot delete your own account', 400);
  }

  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new HttpError('User not found', 404);
  }

  return { message: 'User deleted successfully' };
};

// Get all canvas sessions
export const getAllCanvasSessions = async () => {
  const result = await pool.query(`
    SELECT 
      cs.id, cs.title, cs.user_id, cs.is_authorized, 
      cs.width, cs.height, cs.created_at, cs.updated_at,
      u.name as user_name, u.email as user_email
    FROM canvas_sessions cs
    JOIN users u ON cs.user_id = u.id
    ORDER BY cs.updated_at DESC
  `);
  return result.rows;
};

// Get all certificates (Migrated to canvas_sessions)
export const getAllCertificates = async () => {
  const result = await pool.query(`
    SELECT 
      cs.id, cs.title, cs.holder_name as author_name, cs.is_authorized, 
      ca.authorized_at, cs.organization_name as issued_by, cs.created_at,
      cs.id as canvas_session_id, cs.title as canvas_title,
      u.name as user_name, u.email as user_email,
      cs.certificate_id as verification_code
    FROM canvas_sessions cs
    JOIN users u ON cs.user_id = u.id
    LEFT JOIN certificate_authorizations ca ON ca.canvas_id = cs.id
    WHERE cs.certificate_id IS NOT NULL
    ORDER BY cs.created_at DESC
  `);
  return result.rows;
};

// Get all verification links (Migrated to canvas_sessions)
export const getAllVerificationLinks = async () => {
  const result = await pool.query(`
    SELECT 
      cs.id, cs.certificate_id as verification_code, true as is_active, cs.created_at, 
      cs.id as certificate_id, cs.title as certificate_title, cs.holder_name as author_name,
      cs.is_authorized,
      u.name as user_name, u.email as user_email
    FROM canvas_sessions cs
    JOIN users u ON cs.user_id = u.id
    WHERE cs.certificate_id IS NOT NULL
    ORDER BY cs.created_at DESC
  `);
  return result.rows;
};

// Get all uploaded files
export const getAllUploadedFiles = async () => {
  const result = await pool.query(`
    SELECT 
      uf.id, uf.file_name, uf.file_url, uf.file_type,
      uf.file_size, uf.uploaded_at,
      u.name as user_name, u.email as user_email,
      cs.title as canvas_title
    FROM uploaded_files uf
    JOIN users u ON uf.user_id = u.id
    LEFT JOIN canvas_sessions cs ON uf.canvas_session_id = cs.id
    ORDER BY uf.uploaded_at DESC
  `);
  return result.rows;
};
