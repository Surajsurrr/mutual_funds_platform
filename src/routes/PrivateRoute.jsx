import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// ─── PrivateRoute: requires authentication ────────────────────────────────────
export const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

// ─── RoleRoute: requires specific role(s) ─────────────────────────────────────
export const RoleRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

// ─── PublicRoute: redirect authenticated users away from login/register ───────
export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    const redirectMap = {
      client: '/client/dashboard',
      cb: '/cb/dashboard',
      amc: '/amc/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[user?.role] || '/client/dashboard'} replace />;
  }
  return <Outlet />;
};
