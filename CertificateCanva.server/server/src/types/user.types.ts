export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  role_id: number;
  role_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
}

export interface UpdateUserDTO {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  role_id: number;
  role_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
