import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { fetchEndpoint } from '../fetchEndpoint';

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUserData(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load auth data from localStorage", error);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const data = await fetchEndpoint('/api/auth/login', 'POST', null, { username, password });
      if (data && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setToken(data.token);
        setUserData(data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed: Invalid data received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error to be handled by the calling component (e.g., to show a message)
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setToken(null);
    setUserData(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}