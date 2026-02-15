import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Receipt, LogOut, Menu, X,
  ShoppingBag, UserCircle, ClipboardList,
} from 'lucide-react';
import BestCureLogo from './BestCureLogo';

/**
 * Main application layout — sidebar navigation + header + content area.
 * Navigation items are conditionally rendered based on user role.
 */
export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`nav-item ${isActive(to) ? 'active' : ''}`}
    >
      <Icon size={20} className="nav-icon" />
      <span style={{ flex: 1 }}>{label}</span>
      {isActive(to) && <div className="nav-item-dot" />}
    </Link>
  );

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const pageTitle = () => {
    const map = {
      '/dashboard': 'Overview',
      '/inventory': 'Inventory',
      '/billing': 'Billing',
      '/orders': 'Orders',
      '/portal': 'Order Medicines',
      '/order-history': 'Order History',
    };
    return map[location.pathname] || 'BestCure';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-overlay)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <BestCureLogo variant="icon" size={44} />
          <div className="sidebar-brand-text">
            <h1>Best<span style={{ color: '#34d399' }}>Cure</span></h1>
            <p>ERP System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Menu</p>

          {user?.role === 'admin' && (
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          )}

          {(user?.role === 'admin' || user?.role === 'staff') && (
            <>
              <NavItem to="/inventory" icon={Package} label="Inventory" />
              <NavItem to="/billing" icon={Receipt} label="Billing" />
              <NavItem to="/orders" icon={ClipboardList} label="Orders" />
            </>
          )}

          {user?.role === 'customer' && (
            <>
              <NavItem to="/portal" icon={ShoppingBag} label="Order Medicines" />
              <NavItem to="/order-history" icon={ClipboardList} label="Order History" />
            </>
          )}
        </nav>

        {/* User profile */}
        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                <UserCircle size={20} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p className="sidebar-user-name">{user?.name}</p>
                <p className="sidebar-user-role">{user?.role} Access</p>
              </div>
            </div>
            <button onClick={logout} className="btn-logout" id="btn-logout">
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header className="app-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost"
              style={{ display: 'none' }}
              id="btn-mobile-menu"
            >
              <Menu size={24} />
            </button>
            <h2 className="app-header-title">{pageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="header-date">{currentDate}</div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-8) var(--space-8)' }}
          className="no-scrollbar"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile menu button — show on smaller screens via CSS */}
      <style>{`
        @media (max-width: 1024px) {
          #btn-mobile-menu { display: flex !important; }
        }
      `}</style>
    </div>
  );
}