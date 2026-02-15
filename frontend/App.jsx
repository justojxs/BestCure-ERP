import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import CustomerPortal from './pages/CustomerPortal';
import OrderHistory from './pages/OrderHistory';
import Orders from './pages/Orders';

// redirects to login if not authenticated, or to a fallback if wrong role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'customer' ? '/portal' : '/inventory';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

// sends each role to their default landing page
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user.role === 'customer') return <Navigate to="/portal" replace />;
  return <Navigate to="/inventory" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route path="/" element={<Layout />}>
      <Route index element={<RoleBasedRedirect />} />

      <Route path="dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="inventory" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Inventory />
        </ProtectedRoute>
      } />

      <Route path="orders" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Orders />
        </ProtectedRoute>
      } />

      <Route path="billing" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Billing />
        </ProtectedRoute>
      } />

      <Route path="portal" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerPortal />
        </ProtectedRoute>
      } />

      <Route path="order-history" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <OrderHistory />
        </ProtectedRoute>
      } />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}