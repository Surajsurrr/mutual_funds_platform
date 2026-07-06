import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Spinner } from '../components/UI/Badge';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Route Guards
import { PrivateRoute, RoleRoute, PublicRoute } from './PrivateRoute';

// Auth Pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// Client Pages
import ClientDashboard from '../pages/Client/ClientDashboard';
import AMCListPage from '../pages/Client/AMCListPage';
import SchemeListPage from '../pages/Client/SchemeListPage';
import SchemeDetailPage from '../pages/Client/SchemeDetailPage';
import BuyPage from '../pages/Client/BuyPage';
import PortfolioPage from '../pages/Client/PortfolioPage';
import TransactionHistoryPage from '../pages/Client/TransactionHistoryPage';

// CB Pages
import CBDashboard from '../pages/CB/CBDashboard';

// AMC Pages
import AMCDashboard from '../pages/AMC/AMCDashboard';
import AMCSchemesPage from '../pages/AMC/AMCSchemesPage';
import AMCInvestorsPage from '../pages/AMC/AMCInvestorsPage';

// Admin Pages
import AdminDashboard from '../pages/Admin/AdminDashboard';

const Loader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Spinner size="lg" />
  </div>
);

const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <p className="text-6xl">🔒</p>
    <h1 className="text-2xl font-black text-white">Access Denied</h1>
    <p className="text-slate-400">You don't have permission to view this page.</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ─── Client Routes ─── */}
        <Route element={<RoleRoute allowedRoles={['client']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/amc" element={<AMCListPage />} />
            <Route path="/client/schemes" element={<SchemeListPage />} />
            <Route path="/client/scheme/:id" element={<SchemeDetailPage />} />
            <Route path="/client/buy/:id" element={<BuyPage />} />
            <Route path="/client/portfolio" element={<PortfolioPage />} />
            <Route path="/client/transactions" element={<TransactionHistoryPage />} />
          </Route>
        </Route>

        {/* ─── Corporate Banking Routes ─── */}
        <Route element={<RoleRoute allowedRoles={['cb']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/cb/dashboard" element={<CBDashboard />} />
            <Route path="/cb/clients" element={<CBDashboard />} />
            <Route path="/cb/transactions" element={<CBDashboard />} />
            <Route path="/cb/reports" element={<CBDashboard />} />
          </Route>
        </Route>

        {/* ─── AMC Routes ─── */}
        <Route element={<RoleRoute allowedRoles={['amc']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/amc/dashboard" element={<AMCDashboard />} />
            <Route path="/amc/schemes" element={<AMCSchemesPage />} />
            <Route path="/amc/investors" element={<AMCInvestorsPage />} />
          </Route>
        </Route>

        {/* ─── Admin Routes ─── */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/amcs" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-7xl font-black gradient-text">404</p>
            <p className="text-slate-400">Page not found</p>
            <a href="/login" className="text-blue-400 hover:underline">Go home</a>
          </div>
        } />
      </Routes>
    </Suspense>
  );
};
