import pool from '../config/db';

// Find authorized canvas by ID
export const findAuthorizedCanvasById = async (id: string) => {
    const query = `
    SELECT 
      ac.id,
      ac.canvas_session_id,
      ac.author_name,
      ac.title,
      ac.authorized_date,
      ac.created_at
    FROM authorized_canvases ac
    WHERE ac.id = $1
  `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Find authorized canvas by canvas session ID
export const findAuthorizedByCanvasSessionId = async (canvasSessionId: string) => {
    const query = `
    SELECT 
      ac.id,
      ac.canvas_session_id,
      ac.author_name,
      ac.title,
      ac.authorized_date,
      ac.created_at
    FROM authorized_canvases ac
    WHERE ac.canvas_session_id = $1
  `;
    const result = await pool.query(query, [canvasSessionId]);
    return result.rows[0] || null;
};

// Create a new authorized canvas entry
export const createAuthorizedCanvas = async (
    canvasSessionId: string,
    authorName: string,
    title: string
): Promise<{ id: string }> => {
    const query = `
    INSERT INTO authorized_canvases (canvas_session_id, author_name, title, authorized_date)
    VALUES ($1, $2, $3, CURRENT_DATE)
    RETURNING id
  `;
    const result = await pool.query(query, [canvasSessionId, authorName, title]);
    return { id: result.rows[0].id };
};

// Get all authorized canvases (for admin viewing)
export const findAllAuthorizedCanvases = async () => {
    const query = `
    SELECT 
      ac.id,
      ac.canvas_session_id,
      ac.author_name,
      ac.title,
      ac.authorized_date,
      ac.created_at,
      cs.user_id,
      u.name as user_name,
      u.email as user_email
    FROM authorized_canvases ac
    JOIN canvas_sessions cs ON ac.canvas_session_id = cs.id
    JOIN users u ON cs.user_id = u.id
    ORDER BY ac.created_at DESC
  `;
    const result = await pool.query(query);
    return result.rows;
};
