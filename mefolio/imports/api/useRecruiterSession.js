import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'recruiterAccessToken';
const EXPIRES_KEY = 'recruiterAccessExpiresAt';

function readSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY));
  if (!token || !expiresAt || Number.isNaN(expiresAt)) {
    return { token: null, expiresAt: null };
  }
  return { token, expiresAt };
}

function isSessionValid({ token, expiresAt }) {
  return Boolean(token) && Boolean(expiresAt) && Date.now() < expiresAt;
}

/**
 * Reads/writes the recruiter access token + expiresAt (ms epoch) and
 * exposes whether the current session is still valid.
 *
 * - On mount, re-checks against localStorage so an expired session from
 *   a previous visit is caught immediately on browser reopen.
 * - While the tab stays open, auto-logs out exactly when expiresAt hits,
 *   instead of waiting for the next render/navigation.
 */
export function useRecruiterSession() {
  const [session, setSession] = useState(readSession);

  const login = useCallback((token, expiresAt) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, String(expiresAt));
    setSession({ token, expiresAt });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    setSession({ token: null, expiresAt: null });
  }, []);

  useEffect(() => {
    if (!session.expiresAt) return undefined;
    const msLeft = session.expiresAt - Date.now();
    if (msLeft <= 0) {
      logout();
      return undefined;
    }
    const timer = setTimeout(logout, msLeft);
    return () => clearTimeout(timer);
  }, [session.expiresAt, logout]);

  return {
    token: session.token,
    expiresAt: session.expiresAt,
    isValid: isSessionValid(session),
    login,
    logout,
  };
}
