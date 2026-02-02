export interface AdminCreateUserDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
}

export interface AdminUpdateUserDTO {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role_id?: number;
  is_active?: boolean;
}
