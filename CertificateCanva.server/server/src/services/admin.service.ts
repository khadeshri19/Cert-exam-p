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

  // If creating admin, validate domain
  if (role_id === 1) {
    if (!validateAdminDomain(email)) {
      throw new HttpError(
        `Admin users must have email from: ${ADMIN_DOMAINS.join(' or ')}`,
        400
      );
    }
  }

  // Check if email exists
  const existingEmail = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existingEmail.rows.length > 0) {
    throw new HttpError('Email already exists', 409);
  }

  // Check if username exists
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

// Get all users (admin only)
export const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT u.id, u.name, u.username, u.email, u.role_id, r.role_name, u.is_active, u.created_at, u.updated_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `);
  return result.rows;
};

// Get user by ID (admin only)
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

// Update user (admin only)
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

  // If changing to admin role, validate domain
  if (data.role_id === 1) {
    const emailToCheck = data.email || user.email;
    if (!validateAdminDomain(emailToCheck)) {
      throw new HttpError(
        `Admin users must have email from: ${ADMIN_DOMAINS.join(' or ')}`,
        400
      );
    }
  }

  // Check email uniqueness if changing
  if (data.email && data.email !== user.email) {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [data.email, id]
    );
    if (existing.rows.length > 0) {
      throw new HttpError('Email already exists', 409);
    }
  }

  // Check username uniqueness if changing
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

// Delete user (admin only)
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

// Get all canvas sessions (admin only - view mode)
export const getAllCanvasSessions = async () => {
  const result = await pool.query(`
    SELECT 
      cs.id, cs.title, cs.user_id, cs.is_saved, cs.is_authorized, 
      cs.is_currently_active, cs.session_start, cs.last_active,
      cs.width, cs.height, cs.created_at, cs.updated_at,
      u.name as user_name, u.email as user_email
    FROM canvas_sessions cs
    JOIN users u ON cs.user_id = u.id
    ORDER BY cs.last_active DESC
  `);
  return result.rows;
};

// Get canvas activity logs (admin only)
export const getCanvasActivityLogs = async (canvasSessionId?: string) => {
  let query = `
    SELECT 
      cal.id, cal.canvas_session_id, cal.user_id, cal.action_type, 
      cal.action_data, cal.created_at,
      u.name as user_name, cs.title as canvas_title
    FROM canvas_activity_logs cal
    JOIN users u ON cal.user_id = u.id
    JOIN canvas_sessions cs ON cal.canvas_session_id = cs.id
  `;

  const params: any[] = [];

  if (canvasSessionId) {
    query += ' WHERE cal.canvas_session_id = $1';
    params.push(canvasSessionId);
  }

  query += ' ORDER BY cal.created_at DESC LIMIT 100';

  const result = await pool.query(query, params);
  return result.rows;
};

// Get active canvas sessions (admin only - real-time view)
export const getActiveCanvasSessions = async () => {
  const result = await pool.query(`
    SELECT 
      cs.id, cs.title, cs.user_id, cs.is_saved, cs.is_authorized,
      cs.session_start, cs.last_active, cs.is_currently_active,
      u.name as user_name, u.email as user_email,
      CASE 
        WHEN cs.last_active > NOW() - INTERVAL '5 minutes' THEN true
        ELSE false
      END as is_active
    FROM canvas_sessions cs
    JOIN users u ON cs.user_id = u.id
    WHERE cs.is_currently_active = true
    ORDER BY cs.last_active DESC
  `);
  return result.rows;
};

// Get all certificates (admin only)
export const getAllCertificates = async () => {
  const result = await pool.query(`
    SELECT 
      c.id, c.title, c.author_name, c.is_authorized, c.authorized_at,
      c.issued_by, c.created_at,
      cs.id as canvas_session_id, cs.title as canvas_title,
      u.name as user_name, u.email as user_email,
      vl.verification_code
    FROM certificates c
    JOIN canvas_sessions cs ON c.canvas_session_id = cs.id
    JOIN users u ON c.user_id = u.id
    LEFT JOIN verification_links vl ON vl.certificate_id = c.id
    ORDER BY c.created_at DESC
  `);
  return result.rows;
};

// Get all verification links (admin only)
export const getAllVerificationLinks = async () => {
  const result = await pool.query(`
    SELECT 
      vl.id, vl.verification_code, vl.is_active, vl.created_at, vl.expires_at,
      c.id as certificate_id, c.title as certificate_title, c.author_name,
      c.is_authorized,
      u.name as user_name, u.email as user_email
    FROM verification_links vl
    JOIN certificates c ON vl.certificate_id = c.id
    JOIN users u ON c.user_id = u.id
    ORDER BY vl.created_at DESC
  `);
  return result.rows;
};

// Get all uploaded files (admin only)
export const getAllUploadedFiles = async () => {
  const result = await pool.query(`
    SELECT 
      uf.id, uf.file_name, uf.original_name, uf.file_url, uf.file_type,
      uf.file_size, uf.mime_type, uf.uploaded_at,
      u.name as user_name, u.email as user_email,
      cs.title as canvas_title
    FROM uploaded_files uf
    JOIN users u ON uf.user_id = u.id
    LEFT JOIN canvas_sessions cs ON uf.canvas_session_id = cs.id
    ORDER BY uf.uploaded_at DESC
  `);
  return result.rows;
};
