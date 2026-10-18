import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/auth"
import Loading from "@/components/ui/Loading"
import { landingRoute } from "@/lib/routes"
import type { PermissionKey } from "@/lib/types/Permission"
import type { Role } from "@/lib/types/User"

interface RequirePermissionProps {
  /** Permission the user must have to see the content; without it any signed-in user passes */
  permission?: PermissionKey
  /** Role the user must have to see the content, for a page that belongs to a role and not to a permission */
  role?: Role
  /** Protected content */
  children: ReactNode
}

/** Route guard: shows the children only to a signed-in user with the permission (and the role) asked for, else redirects to /login (no session) or to the page where the user starts; while the session is restored it shows the loading screen */
export function RequirePermission({ permission, role, children }: RequirePermissionProps) {
  const { user, isLoading, can, hasRole } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Loading />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  // the starting page needs the same permission that picked it, so this redirect cannot send the user round in circles
  if ((role && !hasRole(role)) || (permission && !can(permission))) {
    return <Navigate to={landingRoute(user)} replace />
  }

  return children
}
