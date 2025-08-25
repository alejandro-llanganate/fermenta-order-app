'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RegisterUser } from '@/lib/supabase';
import { authService } from '@/lib/auth';

interface AuthContextType {
  user: RegisterUser | null;
  isLoading: boolean;
  signIn: (username: string, cedula: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<RegisterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const signIn = async (username: string, cedula: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signIn(username, cedula);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error interno del servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

