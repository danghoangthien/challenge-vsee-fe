export type UserRole = 'provider' | 'visitor';

export interface User {
  id: number;
  name: string;
  email: string;
  type: UserRole;
  type_id: number;
}

export interface AuthResponse {
  status: string;
  user: User;
  authorisation: {
    token: string;
    type: string;
    expires_in: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
} 