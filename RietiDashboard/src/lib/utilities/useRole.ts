export type Role = 'admin' | 'procurador';

const ROLE_KEY = 'rieti_role';

// TODO: AuthProvider is not mounted yet. When it is, replace this with `useAuth().user?.role`.
// Until then the role is read from localStorage (`rieti_role` = 'admin' | 'procurador'), defaulting to admin.
export function useRole(): Role {
  try {
    return localStorage.getItem(ROLE_KEY) === 'procurador' ? 'procurador' : 'admin';
  } catch {
    return 'admin';
  }
}

// admins can do everything a procurator can, but not the other way around
export const isAdmin = (role: Role) => role === 'admin';

export const roleLabel = (role: Role) => (role === 'admin' ? 'Administrador' : 'Procurador');
