import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { NavBar } from './NavBar';

export function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
