import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

/**
 * Redirects to /login when there is no session; unlike RequireRole it does not check the role
 *
 * @param children - Protected content
 */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (user === null && !isLoading) {
    return <Navigate to="/login" replace />;
  }
  return children;
};