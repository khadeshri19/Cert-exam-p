import pool from '../config/db';
import { HttpError } from '../middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique Certificate ID: sarv-xxxx-xxxx
const generateCertificateId = (): string => {
    const part1 = uuidv4().split('-')[0];
    const part2 = uuidv4().split('-')[1];
    return `sarv-${part1}-${part2}`;
};

// Create a new canvas session (Matches Prompt Rule 1 & 6)
export const createCanvas = async (
    userId: string,
    data: { title: string; width?: number; height?: number }
) => {
    const { title, width = 800, height = 600 } = data;

    const result = await pool.query(
        `INSERT INTO canvas_sessions (user_id, title, width, height)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, width, height`,
        [userId, title, width, height]
    );

    return result.rows[0];
};

// Get a single canvas session (Matches Prompt Rule 6)
export const getCanvas = async (canvasId: string, userId: string, isAdmin: boolean = false) => {
    let query = 'SELECT * FROM canvas_sessions WHERE id = $1';
    let params = [canvasId];

    if (!isAdmin) {
        query += ' AND user_id = $2';
        params.push(userId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
        throw new HttpError('Canvas not found or unauthorized', 404);
    }

    return result.rows[0];
};

// Save canvas data and metadata (Matches Prompt Rule 2 & 6)
export const saveCanvas = async (
    canvasId: string,
    userId: string,
    data: {
        canvas_data: any;
        title: string;
        holder_name: string;
        certificate_title: string;
        issue_date: string;
        organization_name: string;
    }
) => {
    // Check if it already has a certificate_id
    const existing = await pool.query(
        'SELECT certificate_id FROM canvas_sessions WHERE id = $1 AND user_id = $2',
        [canvasId, userId]
    );

    if (existing.rows.length === 0) {
        throw new HttpError('Canvas not found', 404);
    }

    let certId = existing.rows[0].certificate_id;
    if (!certId) {
        certId = generateCertificateId();
    }

    const result = await pool.query(
        `UPDATE canvas_sessions SET
            canvas_data = $1,
            title = $2,
            holder_name = $3,
            certificate_title = $4,
            issue_date = $5,
            organization_name = $6,
            certificate_id = $7,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 AND user_id = $9
         RETURNING *`,
        [
            JSON.stringify(data.canvas_data),
            data.title,
            data.holder_name,
            data.certificate_title,
            data.issue_date,
            data.organization_name,
            certId,
            canvasId,
            userId
        ]
    );

    return result.rows[0];
};

// Get all canvases for current user
export const getAllCanvases = async (userId: string) => {
    const result = await pool.query(
        'SELECT id, title, certificate_id, is_authorized, created_at FROM canvas_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
    );
    return result.rows;
};

// Authorize a certificate (Matches Prompt Rule 2.D & 6)
export const authorizeCertificate = async (canvasId: string, adminId: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update canvas_sessions
        const canvasResult = await client.query(
            `UPDATE canvas_sessions SET
                is_authorized = true,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [canvasId]
        );

        if (canvasResult.rows.length === 0) {
            throw new HttpError('Canvas not found', 404);
        }

        // Insert into certificate_authorizations
        await client.query(
            `INSERT INTO certificate_authorizations (canvas_id, authorized_by)
             VALUES ($1, $2)`,
            [canvasId, adminId]
        );

        await client.query('COMMIT');
        return canvasResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Verify a certificate (Matches Prompt Rule 3 & 6)
export const verifyCertificate = async (certificateId: string) => {
    const result = await pool.query(
        `SELECT cs.*, u.name as owner_name, ca.authorized_at, adm.name as authorized_by_name
         FROM canvas_sessions cs
         LEFT JOIN users u ON u.id = cs.user_id
         LEFT JOIN certificate_authorizations ca ON ca.canvas_id = cs.id
         LEFT JOIN users adm ON adm.id = ca.authorized_by
         WHERE cs.certificate_id = $1`,
        [certificateId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};
