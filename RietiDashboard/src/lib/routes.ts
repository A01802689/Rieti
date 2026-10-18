import type { PermissionKey } from '@/lib/types/Permission'
import { userCan, type SessionUser } from '@/lib/types/User'

/** Route of the page that tells a user of the panel that no page is available for them yet */
export const NO_ACCESS_ROUTE = '/sin-acceso'

/** Pages a user can start in, in order of preference; each one needs the permission that its route asks for */
const LANDING_PAGES: { path: string; permission: PermissionKey }[] = [
  { path: '/home', permission: 'stats.view' },
  { path: '/reports', permission: 'reports.view' },
  { path: '/cases', permission: 'cases.view' },
  { path: '/map', permission: 'map.view' },
]

/**
 * Gives the page where a user starts: after signing in, when they open a page that is not for them and from the "go home" buttons
 *
 * It never gives a page that redirects somewhere else, so using it as the target of a redirect cannot loop
 *
 * @param user - User of the session, null when there is none
 * @returns The first page they can see, the no-access page when there is none, or /login without a session
 */
export const landingRoute = (user: SessionUser | null) => {
  if (!user) return '/login'
  return LANDING_PAGES.find((page) => userCan(user, page.permission))?.path ?? NO_ACCESS_ROUTE
}
