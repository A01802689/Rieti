import { useEffect, useState, type ReactNode } from 'react';
import { login as loginRequest, logout as logoutRequest, getMe } from '@/lib/api/auth';
import { setUnauthorizedHandler } from '@/lib/api/client';
import type { Role, SessionUser } from '@/lib/types/User';
import { AuthContext } from './auth';

/**
 * Keeps the session: restores session from the cookie, signs in and out, and clears it when the API respoonses 401
 *
 * @param children - Encapsulated components that can read the session with useAuth
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // restore the session from the cookie
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // clear the user when the API answers unauthrorized
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(undefined);
  }, []);

  const login = async (correo: string, contrasena: string) => {
    setUser(await loginRequest(correo, contrasena));
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  };

  const hasRole = (role: Role) => user?.rol === role;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin: hasRole('Administrador'), hasRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
