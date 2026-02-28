import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';

// Lazy-loaded pages — these are only downloaded AFTER login, not during initial page load.
// This keeps the login page's JS bundle small and fast to parse.
const Layout = React.lazy(() => import('./components/Layout'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StaffManagement = React.lazy(() => import('./pages/StaffManagement'));
const StaffAnalytics = React.lazy(() => import('./pages/StaffAnalytics'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Billing = React.lazy(() => import('./pages/Billing'));
const CustomerPortal = React.lazy(() => import('./pages/CustomerPortal'));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory'));
const TrackOrders = React.lazy(() => import('./pages/TrackOrders'));
const Favorites = React.lazy(() => import('./pages/Favorites'));
const Account = React.lazy(() => import('./pages/Account'));
const Orders = React.lazy(() => import('./pages/Orders'));

// Full-screen loading spinner shown while lazy chunks are downloading
const LazyFallback = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
  }}>
    <div style={{
      width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: '#0d9488', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

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
  <Suspense fallback={<LazyFallback />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<RoleBasedRedirect />} />

        <Route path="dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="staff" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffManagement />
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

        <Route path="staff-analytics" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <StaffAnalytics />
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

        <Route path="track-orders" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <TrackOrders />
          </ProtectedRoute>
        } />

        <Route path="order-history" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OrderHistory />
          </ProtectedRoute>
        } />

        <Route path="favorites" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Favorites />
          </ProtectedRoute>
        } />

        <Route path="account" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Account />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}