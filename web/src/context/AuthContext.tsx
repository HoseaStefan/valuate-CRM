import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchEndpoint } from '../fetchEndpoint'; // Adjust the import path as necessary

// Add user profile info to the context
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
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('userData');
    }
  }, []);

  const login = (user: User) => {
    localStorage.setItem('userData', JSON.stringify(user));
    setUserData(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
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