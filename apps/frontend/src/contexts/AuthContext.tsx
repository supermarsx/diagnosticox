import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

type User = any;

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ user: User; token: string } | null>;
  logout: () => void;
}

/**
 * AuthContext
 *
 * Centralized authentication state for the frontend. The provider reads
 * token+user from localStorage on startup, and exposes helpers to login/logout.
 * The implementation uses the shared `apiService` which persists auth tokens
 * and provides offline behavior for the app.
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    const u = localStorage.getItem('user');
    if (t) {
      apiService.setToken(t);
      setToken(t);
    }
    if (u) {
      try { setUser(JSON.parse(u)); } catch { localStorage.removeItem('user'); }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiService.login(email, password);
    if (res) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    apiService.clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
