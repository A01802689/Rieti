import { createContext, useContext } from 'react';
import type { Role, SessionUser } from '@/lib/types/User';

/** Session data and actions that AuthProvider shares with the whole app */
export interface AuthContextType {
  /** Signed-in user, null when there is no session */
  user: SessionUser | null;
  /** True while the session is being restored */
  isLoading: boolean;
  /** Whether the user is an Administrador */
  isAdmin: boolean;
  /** Whether the user has the given role */
  hasRole: (role: Role) => boolean;
  /** Signs in and stores the user; rejects with ApiError on failure */
  login: (correo: string, contrasena: string) => Promise<void>;
  /** Closes the session and clears the user */
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Reads the session context
 *
 * @returns The session data and actions
 * @throws When it is used outside an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
