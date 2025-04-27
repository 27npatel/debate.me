"use client";

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
  message?: string;
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

interface Debate {
  _id: string;
  title: string;
  description: string;
  status: string;
  startTime?: string;
  endTime?: string;
  host: User;
  languages: string[];
  topics: string[];
  participants: {
    user: User;
    joinedAt: string;
    leftAt?: string;
    isActive: boolean;
  }[];
  capacity: number;
}

interface Message {
  user: User;
  text: string;
  translatedText?: string;
  translatedTexts?: Record<string, string>;
  timestamp: string;
}

interface Connection {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  lastActive: string;
}

interface ConnectionsResponse {
  success: boolean;
  connections: Connection[];
}

interface DebateSettings {
  allowAnonymous: boolean;
  requireApproval: boolean;
  autoTranslate: boolean;
}

interface ApiError extends Error {
  status?: number;
  message: string;
}

export class ApiClient {
  public API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  private token: string | null = null;

  constructor() {
    // Don't attempt to access localStorage during construction
    // Token will be initialized when needed
  }

  public getHeaders(): HeadersInit {
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
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }
    } catch (error) {
      const apiError = new Error('Server error') as ApiError;
      apiError.status = response.status;
      throw apiError;
    }
    
    // Return the data directly for successful responses (including 201)
    if (response.status >= 200 && response.status < 300) {
      return data;
    }
    
    // Handle error responses
    let errorMessage = 'Request failed';
    if (data.error) {
      errorMessage = data.error;
    } else if (data.message) {
      errorMessage = data.message;
    } else if (data.errors && Array.isArray(data.errors)) {
      errorMessage = data.errors.map((err: { msg?: string; message?: string }) => err.msg || err.message).join(', ');
    }
    
    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    throw error;
  }

  private async fetchWithRetry<T>(url: string, options: RequestInit, retries = 3): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...this.getHeaders(),
        },
      });

      const data = await this.handleResponse<T>(response);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      
      // Only retry on network errors or 5xx server errors
      if (retries > 0 && error instanceof Error) {
        if (error.message.includes('Network') || 
            error.message.includes('Server') || 
            (apiError.status && apiError.status >= 500)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.fetchWithRetry(url, options, retries - 1);
        }
      }
      
      // Only logout on actual authentication errors (401 or 403)
      if (apiError.status === 401 || apiError.status === 403) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
      
      // For other errors, just throw them without logging out
      throw error;
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
      console.log('Sending signup request with data:', { 
        ...data, 
        password: '[REDACTED]' 
      });
      
      const response = await this.fetchWithRetry<AuthResponse>(
        `${this.API_BASE_URL}/auth/signup`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        }
      );

      console.log('Signup response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Signup failed');
      }

      if (!response.user || !response.user._id) {
        throw new Error('Invalid user data received from server');
      }

      if (response.token) {
        this.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        throw new Error(error.message || 'Signup failed. Please try again.');
      }
      throw new Error('An unexpected error occurred during signup');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.fetchWithRetry<AuthResponse>(
        `${this.API_BASE_URL}/auth/login`,
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
      const response = await this.fetchWithRetry<AuthResponse>(
        `${this.API_BASE_URL}/auth/me`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      
      // Validate the response
      if (!response.success || !response.user || !response.user._id) {
        console.error('Invalid user data received from server:', response);
        return {
          success: false,
          user: {
            _id: '',
            username: '',
            name: '',
            email: '',
            preferredLanguage: 'en',
            bio: '',
            location: '',
            avatar: '',
            interests: [],
            socialLinks: {},
            rating: 1000,
            debateStats: {
              won: 0,
              lost: 0,
              drawn: 0
            },
            createdAt: '',
            lastActive: ''
          },
          message: 'Invalid user data received from server'
        };
      }
      
      return response;
    } catch (error) {
      // If server is not running or returns HTML, don't log out
      if (error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('Server returned non-JSON response'))) {
        console.error('Server error:', error);
        // Return a default response instead of throwing
        return {
          success: false,
          user: {
            _id: '',
            username: '',
            name: '',
            email: '',
            preferredLanguage: 'en',
            bio: '',
            location: '',
            avatar: '',
            interests: [],
            socialLinks: {},
            rating: 1000,
            debateStats: {
              won: 0,
              lost: 0,
              drawn: 0
            },
            createdAt: '',
            lastActive: ''
          },
          message: 'Server error. Please try again later.'
        };
      }
      throw error;
    }
  }

  async updateProfile(data: Partial<User> & { password?: string }): Promise<AuthResponse> {
    try {
      console.log('Updating profile with data:', data); // Debug log
      const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
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
      await fetch(`${this.API_BASE_URL}/auth/logout`, {
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
    try {
      const response = await this.fetchWithRetry<{ success: boolean; debates: Debate[] }>(
        `${this.API_BASE_URL}/debates`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error('Get debates error:', error);
      throw error;
    }
  }

  async getDebateById(id: string) {
    try {
      const response = await this.fetchWithRetry<ApiResponse<Debate>>(
        `${this.API_BASE_URL}/debates/${id}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error('Get debate by id error:', error);
      throw error;
    }
  }

  async createDebate(data: {
    title: string;
    description: string;
    languages: string[];
    topics: string[];
    capacity: number;
    startTime?: string;
    timeLimit?: number;
  }) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; debate: Debate }>(
        `${this.API_BASE_URL}/debates`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error('Create debate error:', error);
      throw error;
    }
  }

  async getFriends(): Promise<FriendsResponse> {
    try {
      const response = await this.fetchWithRetry<FriendsResponse>(
        `${this.API_BASE_URL}/friends`,
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
        `${this.API_BASE_URL}/friends/requests`,
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
        `${this.API_BASE_URL}/friends/users`,
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
        `${this.API_BASE_URL}/friends/request`,
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
        `${this.API_BASE_URL}/friends/accept`,
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
        `${this.API_BASE_URL}/friends/decline`,
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
        `${this.API_BASE_URL}/friends/remove`,
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

  // Debate API
  async joinDebate(id: string) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; debate: Debate }>(
        `${this.API_BASE_URL}/debates/${id}/join`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error('Join debate error:', error);
      throw error;
    }
  }

  async leaveDebate(id: string) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; debate: Debate }>(
        `${this.API_BASE_URL}/debates/${id}/leave`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error('Leave debate error:', error);
      throw error;
    }
  }

  async endDebate(id: string) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; debate: Debate }>(
        `${this.API_BASE_URL}/debates/${id}/end`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error('End debate error:', error);
      throw error;
    }
  }

  async sendMessage(id: string, message: { text: string; translatedText?: string; translatedTexts?: Record<string, string> }) {
    try {
      const response = await this.fetchWithRetry<{ success: boolean; message: Message }>(
        `${this.API_BASE_URL}/debates/${id}/messages`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(message),
        }
      );
      return response;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async translateText(text: string, sourceLang: string, targetLang: string) {
    try {
      const response = await this.fetchWithRetry<{ translatedText: string }>(
        `${this.API_BASE_URL}/translate`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ text, sourceLang, targetLang }),
        }
      );
      return response;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async updateDebateStatus(id: string, status: string) {
    const response = await fetch(`${this.API_BASE_URL}/debates/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  }

  async updateDebateSettings(id: string, settings: DebateSettings) {
    const response = await fetch(`${this.API_BASE_URL}/debates/${id}/settings`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ settings })
    });
    return this.handleResponse(response);
  }

  async getRecentConnections(): Promise<ConnectionsResponse> {
    try {
      const response = await this.fetchWithRetry<ConnectionsResponse>(
        `${this.API_BASE_URL}/connections`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error('Get recent connections error:', error);
      throw error;
    }
  }
}

// Create a singleton instance of ApiClient
export const api = new ApiClient(); 