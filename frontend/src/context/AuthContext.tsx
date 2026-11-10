import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { login as loginRequest, logout as logoutRequest } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticating: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEY = 'security-system.session';

interface StoredSession {
  user: User;
  token: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return;

    try {
      const stored: StoredSession = JSON.parse(raw);
      setUser(stored.user);
      setToken(stored.token);
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<User> => {
      setIsAuthenticating(true);
      setError(null);

      try {
        const result = await loginRequest(username, password);

        setUser(result.user);
        setToken(result.token);

        window.localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(result),
        );

        return result.user;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Не удалось войти';

        setError(message);
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    void logoutRequest();
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticating,
      error,
      login,
      logout,
    }),
    [user, token, isAuthenticating, error, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}