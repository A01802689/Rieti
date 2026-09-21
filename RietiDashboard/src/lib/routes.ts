const roleRoutes: Record<string, string> = {
  admin: '/admin/dashboard',
  alimentador: '/alimentador/dashboard',
};

const getRoute = (role: string) => {
  return role === '' ? '/login' : roleRoutes[role]
}

export default getRoute
