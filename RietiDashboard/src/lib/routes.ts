const roleRoutes: Record<string, string> = {
  admin: '/admin/dashboard',
  alimentador: '/alimentador/dashboard',
};

/**
 * Gives the home route of a role
 *
 * @param role - Role name; an empty string means no session
 * @returns The route, or /login when there is no role
 */
const getRoute = (role: string) => {
  return role === '' ? '/login' : roleRoutes[role]
}

export default getRoute
