import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const api = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.get<ApiResponse<T>>(`${API_BASE_URL}${url}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Something went wrong'
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  
  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<ApiResponse<T>>(`${API_BASE_URL}${url}`, data, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Something went wrong'
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  
  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await axios.put<ApiResponse<T>>(`${API_BASE_URL}${url}`, data, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Something went wrong'
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.delete<ApiResponse<T>>(`${API_BASE_URL}${url}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Something went wrong'
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
}; 