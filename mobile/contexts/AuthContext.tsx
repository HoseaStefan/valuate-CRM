import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginError: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  logout: async () => {},
  loginError: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initialize auth from stored data on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await authService.getToken();
        const userData = await authService.getUserData();
        
        if (token && userData) {
          setUser({
            token,
            data: userData,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoginError(null);
      console.log('[AuthContext] Starting login...');
      
      const response: any = await authService.authenticate(username, password);
      
      if (response && response.token && response.user) {
        console.log('[AuthContext] Login successful');
        setUser({ token: response.token, data: response.user });
        return true;
      }
      
      const error = 'Invalid response from server';
      console.error('[AuthContext] Login failed:', error);
      setLoginError(error);
      return false;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      console.error('[AuthContext] Login error:', errorMessage);
      setLoginError(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.clearAuth();
      setUser(null);
      setLoginError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, loginError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
