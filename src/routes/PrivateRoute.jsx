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

// ─── PublicRoute: login/register are the app's entry point ────────────────────
// We intentionally do NOT auto-forward a persisted session into a dashboard, so
// opening the app (or the shared link) always lands on the login page. Signing
// in still routes to the role dashboard explicitly (see LoginPage.onSubmit),
// and protected routes keep their own auth guards.
export const PublicRoute = () => <Outlet />;
