import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

type User = any;

interface AuthContextValue {
  user: User | null;
  token: string | null;
  pkceLogin?: (username?: string) => Promise<{ token?: string; sessionId?: string; refreshToken?: string } | null>;
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

  const pkceLogin = async (username?: string) => {
    // generate a code verifier and code challenge (base64url of sha256)
    const gen = async () => {
      // webcrypto subtle if available
      const cv = Array.from(window.crypto.getRandomValues(new Uint8Array(64))).map(n => ('0' + n.toString(16)).slice(-2)).join('');
      const encoder = new TextEncoder();
      const data = encoder.encode(cv);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      const bytes = new Uint8Array(digest);
      const b64 = btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      return { codeVerifier: cv, codeChallenge: b64 };
    };

    try {
      const { codeVerifier, codeChallenge } = await gen();
      const clientId = window.location.hostname || 'frontend';
      const redirectUri = window.location.origin;
      const start = await apiService.pkceStart(clientId, redirectUri, codeChallenge);
      const complete = await apiService.pkceComplete(start.code, codeVerifier, username);

      // After exchange, introspect token to obtain claims for minimal user info
      if ((complete as any).token) {
        const introspect = await apiService.requestPublic('/auth/introspect', { method: 'POST', body: JSON.stringify({ token: (complete as any).token }) });
        const claims = (introspect as any).claims || {};
        const u = { id: claims.userId, organizationId: claims.organizationId, role: claims.role } as any;
        setUser(u);
        setToken((complete as any).token as string);
        localStorage.setItem('user', JSON.stringify(u));
        return complete as any;
      }
      return null;
    } catch (err) {
      console.error('PKCE login failed', err);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    apiService.clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, pkceLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
