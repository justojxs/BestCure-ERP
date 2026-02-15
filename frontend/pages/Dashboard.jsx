import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, ComposedChart, Line,
} from 'recharts';
import { api } from '../services/api';
import {
  TrendingUp, AlertTriangle, IndianRupee, Package, ArrowUpRight,
  ArrowDownRight, Activity, ShoppingCart, Users, Clock,
  AlertCircle, Truck, BarChart3,
} from 'lucide-react';

/* ─── Chart Colors ─── */
const CHART_COLORS = ['#2dd4bf', '#6366f1', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
const STATUS_COLORS = { Accepted: '#10b981', Pending: '#f59e0b', Rejected: '#ef4444' };

/* ─── Stat Card Component ─── */
const StatCard = ({ title, value, subtext, icon: Icon, trend, color, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="stat-card"
      style={{
        '--stat-accent': color,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s cubic-bezier(0.2,0.8,0.2,1), transform 0.5s cubic-bezier(0.2,0.8,0.2,1)',
      }}
    >
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ background: `${color}12`, color }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend && (
          <span className={`stat-card-trend ${trend.startsWith('+') ? 'up' : 'down'}`}>
            {trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="stat-card-label">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-subtext">{subtext}</p>
      </div>
    </div>
  );
};

/* ─── Custom Tooltip ─── */
const ChartTooltip = ({ active, payload, label, prefix = '₹', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(8px)',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: 'var(--shadow-xl)',
    }}>
      <p style={{ fontSize: 'var(--text-xs)', color: '#94a3b8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{
          fontSize: 'var(--text-md)', fontWeight: 700,
          color: p.color || '#2dd4bf',
        }}>
          {p.name}: {prefix}{Number(p.value).toLocaleString()}{suffix}
        </p>
      ))}
    </div>
  );
};

/* ─── Section Header ─── */
const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: 'var(--space-6)' }}>
    <h3 style={{
      fontSize: 'var(--text-lg)', fontWeight: 700,
      color: 'var(--color-slate-900)',
    }}>{title}</h3>
    {subtitle && (
      <p style={{
        fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)',
        marginTop: 2,
      }}>{subtitle}</p>
    )}
  </div>
);

/* ─── Mini Table for Alerts ─── */
const AlertsTable = ({ alerts, type }) => {
  if (!alerts?.length) {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>
          ✓ All clear — no {type} alerts
        </p>
      </div>
    );
  }

  const severityBadge = (severity) => {
    const map = {
      critical: 'badge-danger', high: 'badge-warning', medium: 'badge-info',
    };
    return map[severity] || 'badge-info';
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
            <th>Min.</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>{a.name}</td>
              <td>
                <span style={{
                  fontWeight: 700, fontFamily: 'var(--font-mono)',
                  color: a.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)',
                }}>{a.stock}</span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate-500)' }}>{a.minStock}</td>
              <td>
                <span className={`badge ${severityBadge(a.severity)}`}>
                  <span className="badge-dot" />
                  {a.severity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Recent Orders Table ─── */
const RecentOrdersTable = ({ orders }) => {
  if (!orders?.length) return null;

  const statusBadge = (s) => {
    const map = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-danger' };
    return map[s] || 'badge-info';
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Order No.</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                {o.orderNumber}
              </td>
              <td>{o.customerName}</td>
              <td>{o.items?.length || 0}</td>
              <td style={{ fontWeight: 600 }}>₹{o.total?.toLocaleString()}</td>
              <td>
                <span className={`badge ${statusBadge(o.status)}`}>
                  <span className="badge-dot" />
                  {o.status}
                </span>
              </td>
              <td style={{ color: 'var(--color-slate-500)', fontSize: 'var(--text-sm)' }}>
                {new Date(o.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute derivative metrics
  const metrics = useMemo(() => {
    if (!stats) return {};
    const fulfillmentRate = stats.totalOrders > 0
      ? Math.round((stats.acceptedOrders / stats.totalOrders) * 100)
      : 0;
    const inventoryValue = stats.categoryData?.reduce(
      (sum, c) => sum + (c.totalValue || 0), 0
    ) || 0;
    return { fulfillmentRate, inventoryValue };
  }, [stats]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Loading Analytics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} className="empty-state-icon" />
        <p className="empty-state-title">Failed to load dashboard</p>
        <p className="empty-state-desc">{error || 'Unknown error'}</p>
        <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}
          onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-col gap-8" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', paddingBottom: 'var(--space-10)' }}>

      {/* ─── Page Header ─── */}
      <div className="page-header animate-fadeIn">
        <div>
          <h1 className="page-title">Performance Overview</h1>
          <p className="page-subtitle">Real-time analytics and inventory insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge badge-success">
            <span className="badge-dot" />
            Live Data
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid-4">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
          subtext={`Avg. order: ₹${stats.avgOrderValue?.toLocaleString() || 0}`}
          trend="+12.5%"
          icon={IndianRupee}
          color="#0d9488"
          delay={50}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          subtext={`${stats.pendingOrders || 0} pending approval`}
          icon={ShoppingCart}
          color="#6366f1"
          delay={100}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount || 0}
          subtext="Items below minimum level"
          icon={AlertTriangle}
          color="#ef4444"
          delay={150}
        />
        <StatCard
          title="Products"
          value={stats.totalProducts || 0}
          subtext={`${stats.totalCustomers || 0} active customers`}
          icon={Package}
          color="#3b82f6"
          delay={200}
        />
      </div>

      {/* ─── Secondary KPIs Row ─── */}
      <div className="grid-4">
        <StatCard
          title="Fulfillment Rate"
          value={`${metrics.fulfillmentRate}%`}
          subtext={`${stats.acceptedOrders || 0} of ${stats.totalOrders || 0} orders`}
          icon={TrendingUp}
          color="#10b981"
          delay={250}
        />
        <StatCard
          title="Inventory Value"
          value={`₹${Math.round(metrics.inventoryValue).toLocaleString()}`}
          subtext="Total stock value at cost"
          icon={BarChart3}
          color="#8b5cf6"
          delay={300}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringCount || 0}
          subtext="Within next 30 days"
          icon={Clock}
          color="#f59e0b"
          delay={350}
        />
        <StatCard
          title="Active Customers"
          value={stats.totalCustomers || 0}
          subtext="Registered clinic accounts"
          icon={Users}
          color="#ec4899"
          delay={400}
        />
      </div>

      {/* ─── Revenue Trend + Order Status Distribution ─── */}
      <div className="grid-auto">
        {/* Revenue Trend Chart */}
        <div className="card animate-slideUp stagger-1">
          <div className="card-body">
            <SectionHeader title="Revenue Trend" subtitle="Monthly revenue from accepted orders" />
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesData || []}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#2dd4bf', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2dd4bf" strokeWidth={3}
                    fill="url(#gradRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2dd4bf' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="card animate-slideUp stagger-2">
          <div className="card-body">
            <SectionHeader title="Order Status" subtitle="Distribution of all orders" />
            <div style={{ height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.orderStatusData || []} cx="50%" cy="50%"
                    innerRadius={80} outerRadius={115} paddingAngle={5}
                    dataKey="value" stroke="none" cornerRadius={6}>
                    {(stats.orderStatusData || []).map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{
                    background: '#0f172a', border: 'none',
                    borderRadius: '12px', color: '#fff', fontSize: '13px',
                  }} itemStyle={{ color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Center overlay */}
              <div style={{
                position: 'absolute', top: '45%', left: '50%',
                transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-slate-800)' }}>
                  {stats.totalOrders || 0}
                </span>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', fontWeight: 600 }}>TOTAL</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Top Products + Category Breakdown ─── */}
      <div className="grid-auto">
        {/* Top Selling Products */}
        <div className="card animate-slideUp stagger-3">
          <div className="card-body">
            <SectionHeader title="Top Selling Products" subtitle="By revenue from accepted orders" />
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts || []} layout="vertical"
                  margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11}
                    tickLine={false} axisLine={false} width={120}
                    tick={{ fill: '#475569', fontWeight: 500 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(45, 212, 191, 0.06)' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20}>
                    {(stats.topProducts || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card animate-slideUp stagger-4">
          <div className="card-body">
            <SectionHeader title="Inventory by Category" subtitle="Product count and stock value" />
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.categoryData || []}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12}
                    tickLine={false} axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar yAxisId="left" dataKey="totalStock" name="Stock Units" fill="#2dd4bf" radius={[6, 6, 0, 0]} barSize={28} opacity={0.8} />
                  <Line yAxisId="right" type="monotone" dataKey="totalValue" name="Value"
                    stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Supplier Breakdown ─── */}
      <div className="card animate-slideUp stagger-5">
        <div className="card-body">
          <SectionHeader title="Supplier Overview" subtitle="Stock distribution and value by supplier" />
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Products</th>
                  <th>Total Stock</th>
                  <th>Avg. Price</th>
                  <th>Stock Value</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {(stats.supplierData || []).map((s, i) => {
                  const totalValue = (stats.supplierData || []).reduce((sum, x) => sum + x.totalValue, 0);
                  const share = totalValue > 0 ? Math.round((s.totalValue / totalValue) * 100) : 0;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                            background: `${CHART_COLORS[i]}12`, color: CHART_COLORS[i],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Truck size={16} />
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{s.products}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{s.totalStock.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>₹{s.avgPrice}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>₹{s.totalValue.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{
                            width: 60, height: 6, borderRadius: 3,
                            background: 'var(--color-slate-100)', overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${share}%`, height: '100%',
                              background: CHART_COLORS[i], borderRadius: 3,
                              transition: 'width 0.8s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-500)' }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Stock Alerts + Recent Orders ─── */}
      <div className="grid-auto">
        {/* Stock Alerts */}
        <div className="card animate-slideUp">
          <div className="card-body">
            <SectionHeader
              title="Stock Alerts"
              subtitle={`${stats.lowStockCount || 0} items need attention`}
            />
            <AlertsTable alerts={stats.stockAlerts} type="stock" />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card animate-slideUp">
          <div className="card-body">
            <SectionHeader title="Recent Orders" subtitle="Latest 10 orders across all customers" />
            <RecentOrdersTable orders={stats.recentOrders} />
          </div>
        </div>
      </div>
    </div>
  );
}