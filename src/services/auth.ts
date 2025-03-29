import api from './api';
import { AuthResponse, LoginCredentials } from '../types/auth';

class AuthService {
  private static instance: AuthService;
  private currentUser: AuthResponse['user'] | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/login', credentials);
      const { user, authorisation } = response.data;
      
      // Store token in localStorage (in a real app, this should be in HttpOnly cookies)
      localStorage.setItem('token', authorisation.token);
      
      // Store user data
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
      this.clearAuthData();
    } catch (error) {
      // Even if the API call fails, we should clear local data
      this.clearAuthData();
      throw error;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  getCurrentUser(): AuthResponse['user'] | null {
    if (!this.currentUser) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export default AuthService.getInstance(); 