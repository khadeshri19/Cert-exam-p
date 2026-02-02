import pool from '../config/db';
import { CreateCanvasDTO, AuthorizeCanvasDTO } from '../types/canvas.types';

export const createCanvas = async (userId: string, data: CreateCanvasDTO) => {
    const { rows } = await pool.query(
        `INSERT INTO canvas_sessions (user_id, title)
     VALUES ($1, $2)
     RETURNING id, user_id, title, is_authorized, created_at, updated_at`,
        [userId, data.title]
    );
    return rows[0];
};

export const getAllCanvases = async () => {
    const { rows } = await pool.query(
        `SELECT cs.*, u.name as user_name, u.email as user_email,
            ac.author_name, ac.authorized_date
     FROM canvas_sessions cs
     LEFT JOIN users u ON cs.user_id = u.id
     LEFT JOIN authorized_canvases ac ON cs.id = ac.canvas_session_id
     ORDER BY cs.created_at DESC`
    );
    return rows;
};

export const getCanvasesByUser = async (userId: string) => {
    const { rows } = await pool.query(
        `SELECT cs.*, ac.author_name, ac.authorized_date
     FROM canvas_sessions cs
     LEFT JOIN authorized_canvases ac ON cs.id = ac.canvas_session_id
     WHERE cs.user_id = $1
     ORDER BY cs.created_at DESC`,
        [userId]
    );
    return rows;
};

export const getCanvasById = async (id: string) => {
    const { rows } = await pool.query(
        `SELECT cs.*, u.name as user_name, u.email as user_email,
            ac.author_name, ac.title as authorized_title, ac.authorized_date
     FROM canvas_sessions cs
     LEFT JOIN users u ON cs.user_id = u.id
     LEFT JOIN authorized_canvases ac ON cs.id = ac.canvas_session_id
     WHERE cs.id = $1`,
        [id]
    );
    return rows[0];
};

export const updateCanvas = async (id: string, data: Partial<CreateCanvasDTO & { is_authorized?: boolean }>) => {
    const allowedFields = ['title', 'is_authorized'];
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
        return getCanvasById(id);
    }

    values.push(id);

    const { rows } = await pool.query(
        `UPDATE canvas_sessions
     SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${index}
     RETURNING id, user_id, title, is_authorized, created_at, updated_at`,
        values
    );

    return rows[0];
};

export const deleteCanvas = async (id: string) => {
    const { rowCount } = await pool.query(
        `DELETE FROM canvas_sessions WHERE id = $1`,
        [id]
    );
    return rowCount && rowCount > 0;
};

export const authorizeCanvas = async (canvasId: string, data: AuthorizeCanvasDTO) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Update canvas to authorized
        await client.query(
            `UPDATE canvas_sessions SET is_authorized = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [canvasId]
        );

        // Create or update authorized canvas entry
        const { rows } = await client.query(
            `INSERT INTO authorized_canvases (canvas_session_id, author_name, title, authorized_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (canvas_session_id)
       DO UPDATE SET author_name = $2, title = $3, authorized_date = $4
       RETURNING *`,
            [canvasId, data.author_name, data.title, data.authorized_date]
        );

        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getAuthorizedCanvas = async (canvasSessionId: string) => {
    const { rows } = await pool.query(
        `SELECT ac.*, cs.title as session_title, u.name as user_name, u.email as user_email
     FROM authorized_canvases ac
     JOIN canvas_sessions cs ON ac.canvas_session_id = cs.id
     JOIN users u ON cs.user_id = u.id
     WHERE ac.canvas_session_id = $1`,
        [canvasSessionId]
    );
    return rows[0];
};

export const getAllAuthorizedCanvases = async () => {
    const { rows } = await pool.query(
        `SELECT ac.*, cs.title as session_title, u.name as user_name, u.email as user_email
     FROM authorized_canvases ac
     JOIN canvas_sessions cs ON ac.canvas_session_id = cs.id
     JOIN users u ON cs.user_id = u.id
     ORDER BY ac.created_at DESC`
    );
    return rows;
};

export const checkCanvasOwnership = async (canvasId: string, userId: string) => {
    const { rows } = await pool.query(
        `SELECT id FROM canvas_sessions WHERE id = $1 AND user_id = $2`,
        [canvasId, userId]
    );
    return rows.length > 0;
};
