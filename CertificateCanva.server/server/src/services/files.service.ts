import pool from '../config/db';
import { HttpError } from '../middlewares/error.middleware';
import * as fs from 'fs';
import * as path from 'path';

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate file
export const validateFile = (file: Express.Multer.File) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new HttpError(
            `Invalid file type. Allowed types: JPG, PNG, PDF`,
            400
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new HttpError(
            `File too large. Maximum size: 5MB`,
            400
        );
    }

    return true;
};

// Upload file
export const uploadFile = async (
    userId: string,
    file: Express.Multer.File,
    canvasSessionId?: string
) => {
    validateFile(file);

    // If canvas session ID provided, verify it belongs to user
    if (canvasSessionId) {
        const canvas = await pool.query(
            'SELECT id FROM canvas_sessions WHERE id = $1 AND user_id = $2',
            [canvasSessionId, userId]
        );
        if (canvas.rows.length === 0) {
            throw new HttpError('Canvas session not found', 404);
        }
    }

    const fileUrl = `/uploads/${file.filename}`;
    const fileType = file.mimetype.split('/')[1];

    const result = await pool.query(
        `INSERT INTO uploaded_files (user_id, canvas_session_id, file_name, original_name, file_url, file_type, file_size, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
        [
            userId,
            canvasSessionId || null,
            file.filename,
            file.originalname,
            fileUrl,
            fileType,
            file.size,
            file.mimetype,
        ]
    );

    return result.rows[0];
};

// Get user's uploaded files
export const getUserFiles = async (userId: string, canvasSessionId?: string) => {
    let query = `
    SELECT * FROM uploaded_files 
    WHERE user_id = $1
  `;
    const params: any[] = [userId];

    if (canvasSessionId) {
        query += ' AND canvas_session_id = $2';
        params.push(canvasSessionId);
    }

    query += ' ORDER BY uploaded_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
};

// Get file by ID
export const getFile = async (id: string, userId: string) => {
    const result = await pool.query(
        'SELECT * FROM uploaded_files WHERE id = $1 AND user_id = $2',
        [id, userId]
    );

    if (result.rows.length === 0) {
        throw new HttpError('File not found', 404);
    }

    return result.rows[0];
};

// Delete file
export const deleteFile = async (id: string, userId: string) => {
    const file = await getFile(id, userId);

    // Delete from filesystem
    const filePath = path.join(__dirname, '../../uploads', file.file_name);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query('DELETE FROM uploaded_files WHERE id = $1', [id]);

    return { message: 'File deleted successfully' };
};

// Associate file with canvas
export const associateFileWithCanvas = async (
    fileId: string,
    canvasSessionId: string,
    userId: string
) => {
    // Verify file belongs to user
    const file = await getFile(fileId, userId);

    // Verify canvas belongs to user
    const canvas = await pool.query(
        'SELECT id FROM canvas_sessions WHERE id = $1 AND user_id = $2',
        [canvasSessionId, userId]
    );
    if (canvas.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    // Update file
    const result = await pool.query(
        'UPDATE uploaded_files SET canvas_session_id = $1 WHERE id = $2 RETURNING *',
        [canvasSessionId, fileId]
    );

    return result.rows[0];
};

// Get file stats for user
export const getFileStats = async (userId: string) => {
    const result = await pool.query(
        `SELECT 
      COUNT(*) as total_files,
      COALESCE(SUM(file_size), 0) as total_size,
      COUNT(CASE WHEN file_type = 'pdf' THEN 1 END) as pdf_count,
      COUNT(CASE WHEN file_type IN ('jpg', 'jpeg', 'png') THEN 1 END) as image_count
     FROM uploaded_files 
     WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0];
};
