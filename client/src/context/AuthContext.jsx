import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '@/api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authGateOpen, setAuthGateOpen] = useState(false);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me');
      setUser(data.user);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (emailOrUsername, password) => {
    const { data } = await api.post('/auth/login', { emailOrUsername, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    setAuthGateOpen(false);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      /* cookie likely already expired — ignore */
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const openAuthGate = useCallback(() => setAuthGateOpen(true), []);
  const closeAuthGate = useCallback(() => setAuthGateOpen(false), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refreshMe,
      authGateOpen,
      openAuthGate,
      closeAuthGate,
    }),
    [user, loading, login, logout, refreshMe, authGateOpen, openAuthGate, closeAuthGate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}