import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  mockLogin: (username?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  mockLogin: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await authService.getToken();
        if (token) {
          const storedUsername = await authService.getUsername();
          setUser({
            token,
            data: {
              username: storedUsername || 'staff',
              fullName: 'Staff',
              namaLengkap: 'Staff',
              role: 'staff',
            },
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      const response: any = await authService.authenticate(username, password);
      if (response && response.token) {
        await authService.setToken(response.token);
        await authService.setRememberMe(rememberMe, username);
        setUser({ token: response.token, data: response.user });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const mockLogin = async (username?: string) => {
    const mockToken = 'mock-token';
    await authService.setToken(mockToken);

    setUser({
      token: mockToken,
      data: {
        username: username || 'staff',
        fullName: 'Staff',
        namaLengkap: 'Staff',
        role: 'staff',
      },
    });
  };

  const logout = async () => {
    await authService.forceClearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, mockLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
