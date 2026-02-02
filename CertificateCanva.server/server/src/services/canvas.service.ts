import pool from '../config/db';
import { HttpError } from '../middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique verification code
const generateVerificationCode = (): string => {
    return `SARV-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
};

// Create a new canvas session
export const createCanvasSession = async (
    userId: string,
    data: { title: string; width?: number; height?: number }
) => {
    const { title, width = 800, height = 600 } = data;

    const result = await pool.query(
        `INSERT INTO canvas_sessions (user_id, title, width, height, is_currently_active, session_start, last_active)
     VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
        [userId, title, width, height]
    );

    // Log activity
    await logCanvasActivity(result.rows[0].id, userId, 'session_start', { title });

    return result.rows[0];
};

// Get all canvas sessions for a user
export const getUserCanvasSessions = async (userId: string) => {
    const result = await pool.query(
        `SELECT cs.*, 
      c.id as certificate_id, c.is_authorized as certificate_authorized,
      vl.verification_code
     FROM canvas_sessions cs
     LEFT JOIN certificates c ON c.canvas_session_id = cs.id
     LEFT JOIN verification_links vl ON vl.certificate_id = c.id
     WHERE cs.user_id = $1
     ORDER BY cs.updated_at DESC`,
        [userId]
    );
    return result.rows;
};

// Get a single canvas session
export const getCanvasSession = async (id: string, userId: string) => {
    const result = await pool.query(
        `SELECT cs.*, 
      c.id as certificate_id, c.is_authorized as certificate_authorized,
      c.author_name, c.title as certificate_title,
      vl.verification_code
     FROM canvas_sessions cs
     LEFT JOIN certificates c ON c.canvas_session_id = cs.id
     LEFT JOIN verification_links vl ON vl.certificate_id = c.id
     WHERE cs.id = $1 AND cs.user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    // Update last active
    await pool.query(
        'UPDATE canvas_sessions SET last_active = CURRENT_TIMESTAMP, is_currently_active = true WHERE id = $1',
        [id]
    );

    return result.rows[0];
};

// Update canvas data (auto-save without generating verification link)
export const updateCanvasData = async (
    id: string,
    userId: string,
    data: {
        canvas_data?: any;
        title?: string;
        background_color?: string;
        background_image?: string;
    }
) => {
    // Verify ownership
    const existing = await pool.query(
        'SELECT id FROM canvas_sessions WHERE id = $1 AND user_id = $2',
        [id, userId]
    );
    if (existing.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    const result = await pool.query(
        `UPDATE canvas_sessions SET
      canvas_data = COALESCE($1, canvas_data),
      title = COALESCE($2, title),
      background_color = COALESCE($3, background_color),
      background_image = COALESCE($4, background_image),
      last_active = CURRENT_TIMESTAMP
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
        [
            data.canvas_data ? JSON.stringify(data.canvas_data) : null,
            data.title,
            data.background_color,
            data.background_image,
            id,
            userId,
        ]
    );

    // Log activity
    await logCanvasActivity(id, userId, 'activity', { action: 'update' });

    return result.rows[0];
};

// SAVE canvas - This generates the verification link!
export const saveCanvas = async (
    id: string,
    userId: string,
    data: {
        canvas_data: any;
        title: string;
        author_name: string;
    }
) => {
    const { canvas_data, title, author_name } = data;

    if (!title || !author_name) {
        throw new HttpError('Title and author name are required to save', 400);
    }

    // Verify ownership
    const existing = await pool.query(
        'SELECT * FROM canvas_sessions WHERE id = $1 AND user_id = $2',
        [id, userId]
    );
    if (existing.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Update canvas session
        await client.query(
            `UPDATE canvas_sessions SET
        canvas_data = $1,
        title = $2,
        is_saved = true,
        is_authorized = true,
        last_active = CURRENT_TIMESTAMP
       WHERE id = $3`,
            [JSON.stringify(canvas_data), title, id]
        );

        // Check if certificate already exists
        const existingCert = await client.query(
            'SELECT id FROM certificates WHERE canvas_session_id = $1',
            [id]
        );

        let certificateId: string;

        if (existingCert.rows.length > 0) {
            // Update existing certificate
            certificateId = existingCert.rows[0].id;
            await client.query(
                `UPDATE certificates SET
          title = $1,
          author_name = $2,
          is_authorized = true,
          authorized_at = CURRENT_TIMESTAMP,
          certificate_data = $3
         WHERE id = $4`,
                [title, author_name, JSON.stringify({ canvas_data, title, author_name }), certificateId]
            );
        } else {
            // Create new certificate
            const certResult = await client.query(
                `INSERT INTO certificates (canvas_session_id, user_id, title, author_name, is_authorized, authorized_at, certificate_data)
         VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, $5)
         RETURNING id`,
                [id, userId, title, author_name, JSON.stringify({ canvas_data, title, author_name })]
            );
            certificateId = certResult.rows[0].id;
        }

        // Check if verification link exists
        const existingLink = await client.query(
            'SELECT id, verification_code FROM verification_links WHERE certificate_id = $1',
            [certificateId]
        );

        let verificationCode: string;

        if (existingLink.rows.length > 0) {
            verificationCode = existingLink.rows[0].verification_code;
        } else {
            // Generate new verification link
            verificationCode = generateVerificationCode();
            await client.query(
                `INSERT INTO verification_links (certificate_id, verification_code, is_active)
         VALUES ($1, $2, true)`,
                [certificateId, verificationCode]
            );
        }

        await client.query('COMMIT');

        // Log activity
        await logCanvasActivity(id, userId, 'save', {
            title,
            author_name,
            verification_code: verificationCode
        });

        return {
            message: 'Canvas saved and certificate authorized successfully',
            canvas_session_id: id,
            certificate_id: certificateId,
            verification_code: verificationCode,
            verification_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${verificationCode}`,
            is_authorized: true,
            can_export: true,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Check if canvas can be exported
export const canExportCanvas = async (id: string, userId: string) => {
    const result = await pool.query(
        `SELECT cs.is_saved, cs.is_authorized, c.id as certificate_id, vl.verification_code
     FROM canvas_sessions cs
     LEFT JOIN certificates c ON c.canvas_session_id = cs.id
     LEFT JOIN verification_links vl ON vl.certificate_id = c.id
     WHERE cs.id = $1 AND cs.user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    const canvas = result.rows[0];

    if (!canvas.is_saved) {
        throw new HttpError('Canvas must be saved before exporting. Please save first to generate verification link.', 400);
    }

    if (!canvas.verification_code) {
        throw new HttpError('No verification link generated. Please save the canvas first.', 400);
    }

    return {
        can_export: true,
        verification_code: canvas.verification_code,
        verification_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${canvas.verification_code}`,
    };
};

// Log export action
export const logExport = async (id: string, userId: string, format: string) => {
    await logCanvasActivity(id, userId, 'export', { format });
    return { success: true };
};

// Delete canvas session
export const deleteCanvasSession = async (id: string, userId: string) => {
    const result = await pool.query(
        'DELETE FROM canvas_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
    );

    if (result.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    return { message: 'Canvas session deleted successfully' };
};

// Update activity (heartbeat)
export const updateActivity = async (id: string, userId: string) => {
    await pool.query(
        `UPDATE canvas_sessions SET 
      last_active = CURRENT_TIMESTAMP, 
      is_currently_active = true 
     WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return { success: true };
};

// End session
export const endSession = async (id: string, userId: string) => {
    await pool.query(
        `UPDATE canvas_sessions SET 
      is_currently_active = false 
     WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    await logCanvasActivity(id, userId, 'session_end', {});

    return { success: true };
};

// Helper: Log canvas activity
const logCanvasActivity = async (
    canvasSessionId: string,
    userId: string,
    actionType: string,
    actionData: any
) => {
    await pool.query(
        `INSERT INTO canvas_activity_logs (canvas_session_id, user_id, action_type, action_data)
     VALUES ($1, $2, $3, $4)`,
        [canvasSessionId, userId, actionType, JSON.stringify(actionData)]
    );
};

// Get canvas with files
export const getCanvasWithFiles = async (id: string, userId: string) => {
    const canvas = await getCanvasSession(id, userId);

    const files = await pool.query(
        `SELECT * FROM uploaded_files WHERE canvas_session_id = $1 ORDER BY uploaded_at DESC`,
        [id]
    );

    return {
        ...canvas,
        files: files.rows,
    };
};
