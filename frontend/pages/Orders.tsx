import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    ClipboardList, CheckCircle, XCircle, Clock, Eye,
    Package, ArrowLeft, FileText, User, Calendar, Search, Filter, Printer
} from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [viewingOrder, setViewingOrder] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [statusNote, setStatusNote] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await api.getOrders();
            setOrders(data.orders || data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        setProcessing(orderId + status);
        try {
            const updated = await api.updateOrderStatus(orderId, status, statusNote);
            setOrders(orders.map(o => o._id === orderId ? updated : o));
            if (viewingOrder?._id === orderId) setViewingOrder(updated);
            setStatusNote('');
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setProcessing(null);
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'all' || o.status === filter;
        const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        rejected: orders.filter(o => o.status === 'rejected').length,
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'accepted': return 'badge badge-success';
            case 'rejected': return 'badge badge-danger';
            default: return 'badge badge-warning';
        }
    };

    // ─── Order Detail View ───
    if (viewingOrder) {
        return (
            <div className="animate-fadeIn">
                <button onClick={() => setViewingOrder(null)} className="btn btn-ghost" style={{ marginBottom: '16px', paddingLeft: 0 }}>
                    <ArrowLeft size={18} /> Back to Orders
                </button>

                <div className="card">
                    {/* Header */}
                    <div className="card-header" style={{ background: 'var(--color-slate-50)', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <span className="badge badge-info" style={{ marginBottom: '12px' }}>
                                    {viewingOrder.orderNumber}
                                </span>
                                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Order Details</h2>
                                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--color-slate-500)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <User size={16} /> {viewingOrder.customerName}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={16} />
                                        {new Date(viewingOrder.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <span className={getStatusBadgeClass(viewingOrder.status)} style={{ fontSize: '14px', padding: '6px 16px' }}>
                                <span className="badge-dot"></span>
                                {viewingOrder.status}
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="card-body" style={{ padding: '32px' }}>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Batch</th>
                                        <th style={{ textAlign: 'right' }}>Qty</th>
                                        <th style={{ textAlign: 'right' }}>Price</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingOrder.items.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: '600' }}>{item.name}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-slate-500)' }}>{item.batch}</td>
                                            <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financials */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <div style={{ width: '300px', background: 'var(--surface-bg)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--color-slate-500)' }}>Subtotal</span>
                                    <span style={{ fontWeight: '600' }}>₹{viewingOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--color-slate-500)' }}>GST (18%)</span>
                                    <span style={{ fontWeight: '600' }}>₹{viewingOrder.tax.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '2px solid var(--color-slate-200)' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '800' }}>Total</span>
                                    <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)' }}>₹{viewingOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="card-footer" style={{ padding: '24px 32px', borderTop: '1px solid var(--surface-border)', background: 'var(--color-slate-50)' }}>
                        {viewingOrder.status === 'pending' && (
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-slate-600)' }}>Process Order</h3>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        placeholder="Add a note (optional)..."
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        className="form-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => handleStatusUpdate(viewingOrder._id, 'accepted')}
                                        disabled={processing}
                                        className="btn btn-success"
                                    >
                                        <CheckCircle size={18} />
                                        {processing === viewingOrder._id + 'accepted' ? 'Accepting...' : 'Accept Order'}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(viewingOrder._id, 'rejected')}
                                        disabled={processing}
                                        className="btn btn-danger"
                                    >
                                        <XCircle size={18} />
                                        {processing === viewingOrder._id + 'rejected' ? 'Rejecting...' : 'Reject Order'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {(viewingOrder.status === 'accepted' || viewingOrder.status === 'pending') && (
                            <div>
                                <button
                                    onClick={() => {
                                        setTimeout(() => window.print(), 100);
                                    }}
                                    className="btn btn-primary"
                                >
                                    <Printer size={18} /> Download / Print Invoice
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── PRINT-ONLY INVOICE TEMPLATE ── */}
                <div className="printable-invoice" style={{ display: 'none' }}>
                    <InvoiceTemplate order={{
                        orderNumber: viewingOrder.orderNumber,
                        customerName: viewingOrder.customerName,
                        items: viewingOrder.items,
                        subtotal: viewingOrder.subtotal,
                        tax: viewingOrder.tax,
                        total: viewingOrder.total,
                        createdAt: viewingOrder.createdAt
                    }} />
                </div>
            </div>
        );
    }

    // ─── Loading State ───
    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading orders...</p>
        </div>
    );

    // ─── Main List View ───
    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Order Management</h1>
                    <p className="page-subtitle">Track and manage customer orders</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="form-input"
                            style={{ paddingLeft: '40px', width: '250px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid-4" style={{ marginBottom: '32px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                            <ClipboardList size={24} />
                        </div>
                        <span className="stat-card-trend up">Live</span>
                    </div>
                    <div>
                        <p className="stat-card-label">Total Orders</p>
                        <p className="stat-card-value">{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                            <Clock size={24} />
                        </div>
                        {stats.pending > 0 && <span className="stat-card-trend down">Action Needed</span>}
                    </div>
                    <div>
                        <p className="stat-card-label">Pending</p>
                        <p className="stat-card-value">{stats.pending}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="stat-card-label">Accepted</p>
                        <p className="stat-card-value">{stats.accepted}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                            <XCircle size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="stat-card-label">Rejected</p>
                        <p className="stat-card-value">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                    { key: 'all', label: 'All Orders' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'rejected', label: 'Rejected' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ borderRadius: '20px' }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Orders Data Grid */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-state">
                                        <div className="empty-state-icon">
                                            <ClipboardList size={48} />
                                        </div>
                                        <h3 className="empty-state-title">No orders found</h3>
                                        <p className="empty-state-desc">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => setViewingOrder(order)}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                                            {order.orderNumber}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={14} color="var(--color-slate-500)" />
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{order.customerName}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--color-slate-500)' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td>{order.items.length} items</td>
                                        <td style={{ fontWeight: '700' }}>₹{order.total.toFixed(2)}</td>
                                        <td>
                                            <span className={getStatusBadgeClass(order.status)}>
                                                <span className="badge-dot"></span>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn btn-ghost btn-sm">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
