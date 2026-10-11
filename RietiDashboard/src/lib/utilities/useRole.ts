/** Role used by the case pages */
export type Role = 'admin' | 'procurador';

const ROLE_KEY = 'rieti_role';

// TODO: AuthProvider is not mounted yet. When it is, replace this with `useAuth().user?.role`.
// Until then the role is read from localStorage (`rieti_role` = 'admin' | 'procurador'), defaulting to admin.
/**
 * Reads the role from localStorage until the AuthProvider session is used
 *
 * @returns The stored role, admin by default
 */
export function useRole(): Role {
  try {
    return localStorage.getItem(ROLE_KEY) === 'procurador' ? 'procurador' : 'admin';
  } catch {
    return 'admin';
  }
}

// admins can do everything a procurator can, but not the other way around
/**
 * Tells if a role is admin
 *
 * @param role - Role to check
 */
export const isAdmin = (role: Role) => role === 'admin';

/**
 * Gives the text shown for a role
 *
 * @param role - Role to describe
 */
export const roleLabel = (role: Role) => (role === 'admin' ? 'Administrador' : 'Procurador');
