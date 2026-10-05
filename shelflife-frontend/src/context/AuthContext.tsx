import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, LoginRequest, User } from '../types/auth';
import * as authService from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shelflife_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('shelflife_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as User;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Validate initial token presence
    const storedToken = localStorage.getItem('shelflife_token');
    const storedUser = localStorage.getItem('shelflife_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    const response = await authService.login(credentials);
    const { token: receivedToken, user: receivedUser } = response;

    localStorage.setItem('shelflife_token', receivedToken);
    localStorage.setItem('shelflife_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
