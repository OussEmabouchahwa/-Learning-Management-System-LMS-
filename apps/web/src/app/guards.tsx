import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/auth-store';
import type { Role } from '@dars/contracts';

/** Redirects to /login if not authenticated */
export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/** Redirects to /dashboard if not the required role */
export function RequireRole({ roles }: { roles: Role[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role as Role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
