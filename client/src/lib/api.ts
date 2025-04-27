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

interface FriendsResponse {
  success: boolean;
  friends: User[];
}

interface FriendRequestsResponse {
  success: boolean;
  incoming: User[];
  outgoing: User[];
}

interface UsersResponse {
  success: boolean;
  users: User[];
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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    
    try {
      return await response.json();
    } catch (e) {
      throw new Error('Failed to parse response data');
    }
  }

  private async fetchWithRetry<T>(url: string, options: RequestInit, retries = 3): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'Accept': 'application/json',
        },
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log(`Retrying request to ${url}... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      console.error(`Network error for ${url}:`, error);
      throw new Error(`Failed to connect to server. Please make sure the server is running at ${API_BASE_URL}`);
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
      const response = await this.fetchWithRetry<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      if (response.token) {
        this.setToken(response.token);
      }

      return response;
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

  async getDebates() {
    const response = await fetch(`${API_BASE_URL}/debates`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getDebateById(id: string) {
    const response = await fetch(`${API_BASE_URL}/debates/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createDebate(data: {
    title: string;
    description: string;
    languages: string[];
    topics: string[];
    capacity: number;
    startTime?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/debates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getFriends(): Promise<FriendsResponse> {
    try {
      const response = await this.fetchWithRetry<FriendsResponse>(
        `${API_BASE_URL}/friends`,
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      console.error('Get friends error:', error);
      throw error;
    }
  }

  async getFriendRequests(): Promise<FriendRequestsResponse> {
    try {
      const response = await this.fetchWithRetry<FriendRequestsResponse>(
        `${API_BASE_URL}/friends/requests`,
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      console.error('Get friend requests error:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<UsersResponse> {
    try {
      const response = await this.fetchWithRetry<UsersResponse>(
        `${API_BASE_URL}/friends/users`,
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  async sendFriendRequest(userId: string) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/friends/request`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ toUserId: userId }),
        }
      );
      return response;
    } catch (error) {
      console.error('Send friend request error:', error);
      throw error;
    }
  }

  async acceptFriendRequest(userId: string) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/friends/accept`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ fromUserId: userId }),
        }
      );
      return response;
    } catch (error) {
      console.error('Accept friend request error:', error);
      throw error;
    }
  }

  async declineFriendRequest(userId: string) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/friends/decline`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ fromUserId: userId }),
        }
      );
      return response;
    } catch (error) {
      console.error('Decline friend request error:', error);
      throw error;
    }
  }

  async removeFriend(userId: string) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/friends/remove`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ friendId: userId }),
        }
      );
      return response;
    } catch (error) {
      console.error('Remove friend error:', error);
      throw error;
    }
  }
}

// Create a singleton instance of ApiClient
export const api = new ApiClient(); 