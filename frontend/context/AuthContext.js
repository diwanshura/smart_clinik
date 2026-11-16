'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { setUnauthorizedHandler, tokenStore } from '@/services/api';
import { disconnectSocket } from '@/lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  // `ready` flips to true once we've looked at localStorage, so guards never flash the login page.
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    disconnectSocket();
    setUser(null);
  }, []);

  // Restore the session, then quietly refresh the user from the server.
  useEffect(() => {
    const token = tokenStore.getToken();
    const cached = tokenStore.getUser();
    if (token && cached) setUser(cached);
    setReady(true);

    if (!token) return;
    let cancelled = false;
    authService
      .me()
      .then(({ user: fresh }) => {
        if (cancelled || !fresh) return;
        tokenStore.saveUser(fresh);
        setUser(fresh);
      })
      .catch(() => {
        /* 401 is handled by the unauthorized handler; network errors keep the cached session */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from an authenticated request (expired / revoked token) ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      router.replace('/login?reason=expired');
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, router]);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    tokenStore.save(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (payload) => {
    const data = await authService.googleLogin(payload);
    tokenStore.save(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    tokenStore.save(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    router.replace('/login');
  }, [clearSession, router]);

  const updateUser = useCallback((nextUser) => {
    tokenStore.saveUser(nextUser);
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({ user, ready, isAuthenticated: !!user, login, loginWithGoogle, register, logout, updateUser }),
    [user, ready, login, loginWithGoogle, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
