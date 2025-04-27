"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  preferredLanguage: string;
}

interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  preferredLanguage: string;
  bio: string;
  location: string;
  avatar: string;
  interests: string[];
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  rating: number;
  debateStats: {
    won: number;
    lost: number;
    drawn: number;
  };
  createdAt: string;
  lastActive: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user: User;
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    // Don't attempt to access localStorage during construction
    // Token will be initialized when needed
  }

  private getHeaders(): HeadersInit {
    // Lazy initialization of token when headers are needed
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('token');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      } catch (e) {
        throw new Error('An error occurred while processing the response');
      }
    }
    
    try {
      return await response.json();
    } catch (e) {
      throw new Error('Failed to parse response data');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);

      if (result.token) {
        this.setToken(result.token);
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);

      if (result.token) {
        this.setToken(result.token);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders(),
      });

      return this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async updateProfile(data: Partial<User> & { password?: string }): Promise<AuthResponse> {
    try {
      console.log('Updating profile with data:', data); // Debug log
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);

      // If we get a new token (after password change) update it
      if (result.token) {
        this.setToken(result.token);
      }

      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Attempt to call the logout endpoint
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear token, even if server request fails
      this.setToken(null);
    }
  }
}

// Create a singleton instance of ApiClient
export const api = new ApiClient(); 