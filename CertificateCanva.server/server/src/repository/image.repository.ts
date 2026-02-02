import pool from '../config/db';
import { CreateImageDTO } from '../types/image.types';

export const createImage = async (data: CreateImageDTO) => {
    const { rows } = await pool.query(
        `INSERT INTO images (user_id, file_name, file_url, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, file_name, file_url, file_type, file_size, uploaded_at`,
        [data.user_id, data.file_name, data.file_url, data.file_type, data.file_size]
    );
    return rows[0];
};

export const getAllImages = async () => {
    const { rows } = await pool.query(
        `SELECT i.*, u.name as user_name, u.email as user_email
     FROM images i
     JOIN users u ON i.user_id = u.id
     ORDER BY i.uploaded_at DESC`
    );
    return rows;
};

export const getImagesByUser = async (userId: string) => {
    const { rows } = await pool.query(
        `SELECT * FROM images WHERE user_id = $1 ORDER BY uploaded_at DESC`,
        [userId]
    );
    return rows;
};

export const getImageById = async (id: string) => {
    const { rows } = await pool.query(
        `SELECT i.*, u.name as user_name, u.email as user_email
     FROM images i
     JOIN users u ON i.user_id = u.id
     WHERE i.id = $1`,
        [id]
    );
    return rows[0];
};

export const deleteImage = async (id: string) => {
    // First get the image to return its file path for cleanup
    const image = await getImageById(id);

    if (!image) return null;

    const { rowCount } = await pool.query(
        `DELETE FROM images WHERE id = $1`,
        [id]
    );

    return rowCount && rowCount > 0 ? image : null;
};

export const checkImageOwnership = async (imageId: string, userId: string) => {
    const { rows } = await pool.query(
        `SELECT id FROM images WHERE id = $1 AND user_id = $2`,
        [imageId, userId]
    );
    return rows.length > 0;
};

export const getImageStats = async (userId?: string) => {
    let query = `
    SELECT 
      COUNT(*) as total_images,
      COALESCE(SUM(file_size), 0) as total_size,
      COUNT(DISTINCT file_type) as file_types
    FROM images
  `;

    const params: any[] = [];

    if (userId) {
        query += ' WHERE user_id = $1';
        params.push(userId);
    }

    const { rows } = await pool.query(query, params);
    return rows[0];
};
