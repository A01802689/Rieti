import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children } : any) => {
  const { user, isLoading } = useAuth();
  if (user === null && !isLoading) {
    return <Navigate to="/login" replace />;
  }
  return children;
};