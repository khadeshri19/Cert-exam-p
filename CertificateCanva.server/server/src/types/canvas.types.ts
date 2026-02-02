export interface CanvasSession {
    id: string;
    user_id: string;
    title: string;
    is_authorized: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateCanvasDTO {
    title: string;
}

export interface UpdateCanvasDTO {
    title?: string;
    is_authorized?: boolean;
}

export interface AuthorizeCanvasDTO {
    author_name: string;
    title: string;
    authorized_date: string;
}

export interface AuthorizedCanvas {
    id: string;
    canvas_session_id: string;
    author_name: string;
    title: string;
    authorized_date: Date;
    created_at: Date;
}

export interface CanvasWithAuth extends CanvasSession {
    author_name?: string;
    authorized_date?: Date;
    user_name?: string;
    user_email?: string;
}
