export interface Image {
    id: string;
    user_id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    uploaded_at: Date;
}

export interface CreateImageDTO {
    user_id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
}

export interface ImageResponse {
    id: string;
    user_id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    uploaded_at: Date;
}
