
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void; // Simplified login
  signup: (email: string, name?: string) => void; // Simplified signup
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pizzaPlaceUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('pizzaPlaceUser');
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name?: string) => {
    const mockUser: User = { id: Date.now().toString(), email, name: name || email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('pizzaPlaceUser', JSON.stringify(mockUser));
    router.push('/profile');
  };

  const signup = (email: string, name?: string) => {
    // In a real app, this would involve password handling and API calls
    const mockUser: User = { id: Date.now().toString(), email, name: name || email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('pizzaPlaceUser', JSON.stringify(mockUser));
    router.push('/profile');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pizzaPlaceUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
