import pool from '../config/db';
import { HttpError } from '../middlewares/error.middleware';

// Verify certificate by certificate_id (PUBLIC)
export const verifyCertificate = async (certificateId: string) => {
    const result = await pool.query(
        `SELECT 
      cs.id as canvas_id,
      cs.title,
      cs.holder_name as author_name,
      cs.is_authorized,
      ca.authorized_at,
      cs.organization_name as issued_by,
      cs.created_at,
      cs.certificate_id as verification_code,
      u.name as user_name,
      u.email as user_email
     FROM canvas_sessions cs
     JOIN users u ON cs.user_id = u.id
     LEFT JOIN certificate_authorizations ca ON ca.canvas_id = cs.id
     WHERE cs.certificate_id = $1`,
        [certificateId]
    );

    if (result.rows.length === 0) {
        return {
            valid: false,
            message: '❌ This certificate is NOT valid',
            details: 'The verification code does not exist in our system.',
        };
    }

    const cert = result.rows[0];

    // Check if certificate is authorized
    if (!cert.is_authorized) {
        return {
            valid: false,
            message: '❌ This certificate is NOT valid',
            details: 'This certificate has not been authorized by an admin.',
        };
    }

    // Certificate is valid!
    return {
        valid: true,
        message: '✅ This certificate is valid and authorized',
        certificate: {
            title: cert.title,
            author_name: cert.author_name,
            created_date: cert.created_at,
            authorized_date: cert.authorized_at,
            issued_by: cert.issued_by || 'Sarvarth Platform',
            verification_code: cert.verification_code,
        },
    };
};

// Get verification status for a canvas
export const getVerificationStatus = async (canvasSessionId: string, userId: string) => {
    const result = await pool.query(
        `SELECT 
      cs.id as canvas_id,
      cs.title as canvas_title,
      cs.certificate_id as verification_code,
      cs.is_authorized,
      cs.holder_name as author_name,
      cs.certificate_title,
      ca.authorized_at
     FROM canvas_sessions cs
     LEFT JOIN certificate_authorizations ca ON ca.canvas_id = cs.id
     WHERE cs.id = $1 AND cs.user_id = $2`,
        [canvasSessionId, userId]
    );

    if (result.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    const data = result.rows[0];

    if (!data.verification_code) {
        return {
            has_verification: false,
            message: 'No certificate generated yet. Save the canvas to generate a unique ID.',
            can_export: false,
        };
    }

    return {
        has_verification: true,
        verification_code: data.verification_code,
        verification_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${data.verification_code}`,
        is_authorized: data.is_authorized,
        author_name: data.author_name,
        title: data.certificate_title,
        authorized_at: data.authorized_at,
        can_export: true,
    };
};
