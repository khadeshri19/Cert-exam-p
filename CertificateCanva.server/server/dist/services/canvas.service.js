"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificate = exports.authorizeCertificate = exports.getAllCanvases = exports.saveCanvas = exports.getCanvas = exports.createCanvas = void 0;
const db_1 = __importDefault(require("../config/db"));
const error_middleware_1 = require("../middlewares/error.middleware");
const uuid_1 = require("uuid");
// Generate a unique Certificate ID: sarv-xxxx-xxxx
const generateCertificateId = () => {
    const part1 = (0, uuid_1.v4)().split('-')[0];
    const part2 = (0, uuid_1.v4)().split('-')[1];
    return `sarv-${part1}-${part2}`;
};
// Create a new canvas session (Matches Prompt Rule 1 & 6)
const createCanvas = async (userId, data) => {
    const { title, width = 800, height = 600 } = data;
    const result = await db_1.default.query(`INSERT INTO canvas_sessions (user_id, title, width, height)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, width, height`, [userId, title, width, height]);
    return result.rows[0];
};
exports.createCanvas = createCanvas;
// Get a single canvas session (Matches Prompt Rule 6)
const getCanvas = async (canvasId, userId, isAdmin = false) => {
    let query = 'SELECT * FROM canvas_sessions WHERE id = $1';
    let params = [canvasId];
    if (!isAdmin) {
        query += ' AND user_id = $2';
        params.push(userId);
    }
    const result = await db_1.default.query(query, params);
    if (result.rows.length === 0) {
        throw new error_middleware_1.HttpError('Canvas not found or unauthorized', 404);
    }
    return result.rows[0];
};
exports.getCanvas = getCanvas;
// Save canvas data and metadata (Matches Prompt Rule 2 & 6)
const saveCanvas = async (canvasId, userId, data) => {
    // Check if it already has a certificate_id
    const existing = await db_1.default.query('SELECT certificate_id FROM canvas_sessions WHERE id = $1 AND user_id = $2', [canvasId, userId]);
    if (existing.rows.length === 0) {
        throw new error_middleware_1.HttpError('Canvas not found', 404);
    }
    let certId = existing.rows[0].certificate_id;
    if (!certId) {
        certId = generateCertificateId();
    }
    const result = await db_1.default.query(`UPDATE canvas_sessions SET
            canvas_data = $1,
            title = $2,
            holder_name = $3,
            certificate_title = $4,
            issue_date = $5,
            organization_name = $6,
            certificate_id = $7,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 AND user_id = $9
         RETURNING *`, [
        JSON.stringify(data.canvas_data),
        data.title,
        data.holder_name,
        data.certificate_title,
        data.issue_date,
        data.organization_name,
        certId,
        canvasId,
        userId
    ]);
    return result.rows[0];
};
exports.saveCanvas = saveCanvas;
// Get all canvases for current user
const getAllCanvases = async (userId) => {
    const result = await db_1.default.query('SELECT id, title, certificate_id, is_authorized, created_at FROM canvas_sessions WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    return result.rows;
};
exports.getAllCanvases = getAllCanvases;
// Authorize a certificate (Matches Prompt Rule 2.D & 6)
const authorizeCertificate = async (canvasId, adminId) => {
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // Update canvas_sessions
        const canvasResult = await client.query(`UPDATE canvas_sessions SET
                is_authorized = true,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`, [canvasId]);
        if (canvasResult.rows.length === 0) {
            throw new error_middleware_1.HttpError('Canvas not found', 404);
        }
        // Insert into certificate_authorizations
        await client.query(`INSERT INTO certificate_authorizations (canvas_id, authorized_by)
             VALUES ($1, $2)`, [canvasId, adminId]);
        await client.query('COMMIT');
        return canvasResult.rows[0];
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.authorizeCertificate = authorizeCertificate;
// Verify a certificate (Matches Prompt Rule 3 & 6)
const verifyCertificate = async (certificateId) => {
    const result = await db_1.default.query(`SELECT cs.*, u.name as owner_name, ca.authorized_at, adm.name as authorized_by_name
         FROM canvas_sessions cs
         LEFT JOIN users u ON u.id = cs.user_id
         LEFT JOIN certificate_authorizations ca ON ca.canvas_id = cs.id
         LEFT JOIN users adm ON adm.id = ca.authorized_by
         WHERE cs.certificate_id = $1`, [certificateId]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
};
exports.verifyCertificate = verifyCertificate;
//# sourceMappingURL=canvas.service.js.map