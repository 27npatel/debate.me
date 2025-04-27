"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, AuthResponse } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { username: string; name: string; email: string; password: string; preferredLanguage: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only run on client-side
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Only access localStorage on client-side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const { user } = await api.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      if (typeof window !== 'undefined') {
        // Only clear token on client-side
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user } = await api.login({ email, password });
      setUser(user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (data: { username: string; name: string; email: string; password: string; preferredLanguage: string }) => {
    try {
      const { user } = await api.signup(data);
      setUser(user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user state even if the server request fails
      setUser(null);
      router.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 