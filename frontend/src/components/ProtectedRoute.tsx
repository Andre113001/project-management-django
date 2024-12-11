import { Navigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}   