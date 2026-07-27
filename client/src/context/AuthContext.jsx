import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('lm_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('lm_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('lm_token');
        localStorage.removeItem('lm_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('lm_token', res.data.token);
    localStorage.setItem('lm_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem('lm_token', res.data.token);
    localStorage.setItem('lm_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lm_token');
    localStorage.removeItem('lm_user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authApi.getMe();
    setUser(res.data.user);
    localStorage.setItem('lm_user', JSON.stringify(res.data.user));
  }, []);

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
