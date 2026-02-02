import pool from '../config/db';
import { HttpError } from '../middlewares/error.middleware';

// Verify certificate by verification code (PUBLIC - no auth required)
export const verifyCertificate = async (verificationCode: string) => {
    const result = await pool.query(
        `SELECT 
      c.id as certificate_id,
      c.title,
      c.author_name,
      c.is_authorized,
      c.authorized_at,
      c.issued_by,
      c.created_at,
      vl.verification_code,
      vl.is_active,
      vl.expires_at,
      u.name as user_name,
      u.email as user_email
     FROM verification_links vl
     JOIN certificates c ON vl.certificate_id = c.id
     JOIN users u ON c.user_id = u.id
     WHERE vl.verification_code = $1`,
        [verificationCode]
    );

    if (result.rows.length === 0) {
        return {
            valid: false,
            message: '❌ This certificate is NOT valid',
            details: 'The verification code does not exist in our system.',
        };
    }

    const cert = result.rows[0];

    // Check if link is active
    if (!cert.is_active) {
        return {
            valid: false,
            message: '❌ This certificate is NOT valid',
            details: 'The verification link has been deactivated.',
        };
    }

    // Check if link has expired
    if (cert.expires_at && new Date(cert.expires_at) < new Date()) {
        return {
            valid: false,
            message: '❌ This certificate is NOT valid',
            details: 'The verification link has expired.',
        };
    }

    // Check if certificate is authorized
    if (!cert.is_authorized) {
        return {
            valid: false,
            message: '❌ This certificate is NOT valid',
            details: 'This certificate has not been authorized.',
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
            issued_by: cert.issued_by || 'Sarvarth',
            verification_code: cert.verification_code,
        },
    };
};

// Get verification status for a canvas (user's own canvas)
export const getVerificationStatus = async (canvasSessionId: string, userId: string) => {
    const result = await pool.query(
        `SELECT 
      cs.id as canvas_id,
      cs.title as canvas_title,
      cs.is_saved,
      cs.is_authorized,
      c.id as certificate_id,
      c.title as certificate_title,
      c.author_name,
      c.is_authorized as certificate_authorized,
      c.authorized_at,
      vl.verification_code,
      vl.is_active
     FROM canvas_sessions cs
     LEFT JOIN certificates c ON c.canvas_session_id = cs.id
     LEFT JOIN verification_links vl ON vl.certificate_id = c.id
     WHERE cs.id = $1 AND cs.user_id = $2`,
        [canvasSessionId, userId]
    );

    if (result.rows.length === 0) {
        throw new HttpError('Canvas session not found', 404);
    }

    const data = result.rows[0];

    if (!data.is_saved) {
        return {
            has_verification: false,
            message: 'Canvas not saved yet. Save to generate verification link.',
            can_export: false,
        };
    }

    if (!data.verification_code) {
        return {
            has_verification: false,
            message: 'No verification link generated. Please save the canvas.',
            can_export: false,
        };
    }

    return {
        has_verification: true,
        verification_code: data.verification_code,
        verification_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${data.verification_code}`,
        is_authorized: data.certificate_authorized,
        author_name: data.author_name,
        title: data.certificate_title,
        authorized_at: data.authorized_at,
        can_export: true,
    };
};
