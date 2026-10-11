import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/auth"
import Loading from "@/components/ui/Loading"
import type { Role } from "@/lib/types/User"

interface RequireRoleProps {
  /** Role the user must have to see the content */
  role: Role
  /** Protected content */
  children: ReactNode
}

/** Route guard: shows the children only to a signed-in user with the given role, else redirects to /login or /home */
export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, isLoading, hasRole } = useAuth()

  if (isLoading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!hasRole(role)) return <Navigate to="/home" replace />

  return children
}
