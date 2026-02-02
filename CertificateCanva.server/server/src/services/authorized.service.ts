import { HttpError } from '../middlewares/error.middleware';
import * as authorizedRepository from '../repository/authorized.repository';

export interface AuthorizedCertificateResult {
    valid: boolean;
    message: string;
    certificate?: {
        id: string;
        title: string;
        author_name: string;
        authorized_date: string;
        canvas_session_id: string;
        created_at: string;
    };
}

// Get authorized certificate by ID (public verification)
export const getAuthorizedCertificate = async (id: string): Promise<AuthorizedCertificateResult> => {
    if (!id) {
        throw new HttpError('Certificate ID is required', 400);
    }

    const authorized = await authorizedRepository.findAuthorizedCanvasById(id);

    if (!authorized) {
        return {
            valid: false,
            message: 'Invalid Certificate - No authorized certificate found with this ID',
        };
    }

    return {
        valid: true,
        message: 'Valid Certificate',
        certificate: {
            id: authorized.id,
            title: authorized.title,
            author_name: authorized.author_name,
            authorized_date: authorized.authorized_date,
            canvas_session_id: authorized.canvas_session_id,
            created_at: authorized.created_at,
        },
    };
};

// Create an authorized canvas entry when a certificate is finalized
export const createAuthorizedCanvas = async (
    canvasSessionId: string,
    authorName: string,
    title: string
): Promise<{ id: string }> => {
    const result = await authorizedRepository.createAuthorizedCanvas(
        canvasSessionId,
        authorName,
        title
    );
    return result;
};

// Get authorized canvas by canvas session ID
export const getAuthorizedByCanvasSessionId = async (canvasSessionId: string) => {
    return await authorizedRepository.findAuthorizedByCanvasSessionId(canvasSessionId);
};
