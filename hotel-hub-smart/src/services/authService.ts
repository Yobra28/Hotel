import api from './api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'receptionist' | 'housekeeping' | 'guest';
  phone?: string;
  idNumber?: string;
  department?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'receptionist' | 'housekeeping' | 'guest';
  phone?: string;
  idNumber?: string;
  department?: string;
}

export interface LoginData {
  email: string;
  password: string;
  role?: 'admin' | 'receptionist' | 'housekeeping' | 'guest';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: any;
  };
}

class AuthService {
  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Login user
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const { data } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('hotelToken', data.token);
      localStorage.setItem('hotelRefreshToken', data.refreshToken);
      localStorage.setItem('hotelUser', JSON.stringify(data.user));
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('hotelRefreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      localStorage.removeItem('hotelToken');
      localStorage.removeItem('hotelRefreshToken');
      localStorage.removeItem('hotelUser');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ user: User }> {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<{ user: User }> {
    try {
      const response = await api.put('/auth/profile', userData);
      
      // Update stored user data
      const storedUser = localStorage.getItem('hotelUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, ...response.data.data.user };
        localStorage.setItem('hotelUser', JSON.stringify(updatedUser));
      }
      
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword: password
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('hotelToken');
    const user = localStorage.getItem('hotelUser');
    return !!(token && user);
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('hotelUser');
    return userData ? JSON.parse(userData) : null;
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('hotelToken');
  }

  // Handle API errors
  private handleError(error: any): Error {
    if (error.response?.data?.error?.message) {
      return new Error(error.response.data.error.message);
    }
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }
}

export default new AuthService();