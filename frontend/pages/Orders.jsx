import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    ClipboardList, CheckCircle, XCircle, Clock, Eye, ChevronDown,
    Package, AlertCircle, ArrowLeft, FileText, User, Calendar
} from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
    const config = {
        pending: { bg: 'rgba(245,158,11,0.08)', color: '#d97706', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Pending' },
        accepted: { bg: 'rgba(5,150,105,0.08)', color: '#059669', border: 'rgba(5,150,105,0.2)', icon: CheckCircle, label: 'Accepted' },
        rejected: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.2)', icon: XCircle, label: 'Rejected' },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    const padding = size === 'lg' ? '7px 16px' : '5px 12px';
    const fontSize = size === 'lg' ? '13px' : '12px';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding, borderRadius: '8px', fontSize, fontWeight: '600',
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        }}>
            <Icon size={size === 'lg' ? 15 : 13} />
            {c.label}
        </span>
    );
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [viewingOrder, setViewingOrder] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [statusNote, setStatusNote] = useState('');

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

    const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        rejected: orders.filter(o => o.status === 'rejected').length,
    };

    // ─── Order Detail ───
    if (viewingOrder) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <button onClick={() => setViewingOrder(null)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: 'none', color: '#64748b',
                    fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0,
                }}>
                    <ArrowLeft size={18} /> Back to Orders
                </button>

                <div style={{
                    background: '#ffffff', borderRadius: '16px',
                    border: '1px solid rgba(226,232,240,0.6)', overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '28px 32px',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: 'white',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 12px', background: 'rgba(255,255,255,0.08)',
                                    borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                                    marginBottom: '12px', color: 'rgba(226,232,240,0.7)',
                                }}>
                                    <FileText size={13} />
                                    {viewingOrder.orderNumber}
                                </div>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Order Details</h2>
                                <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'rgba(148,163,184,0.7)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <User size={14} /> {viewingOrder.customerName}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        {new Date(viewingOrder.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <StatusBadge status={viewingOrder.status} size="lg" />
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ padding: '24px 32px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {['Item', 'Batch', 'Qty', 'Price', 'Total'].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 0', fontSize: '11px', fontWeight: '600',
                                            color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px',
                                            textAlign: ['Price', 'Total', 'Qty'].includes(h) ? 'right' : 'left',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {viewingOrder.items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '14px 0', fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{item.name}</td>
                                        <td style={{ padding: '14px 0', fontSize: '12px', color: '#94a3b8', fontFamily: "'SF Mono', monospace" }}>{item.batch}</td>
                                        <td style={{ padding: '14px 0', textAlign: 'right', fontSize: '14px', color: '#475569' }}>{item.quantity}</td>
                                        <td style={{ padding: '14px 0', textAlign: 'right', fontSize: '14px', color: '#475569' }}>₹{item.price.toFixed(2)}</td>
                                        <td style={{ padding: '14px 0', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <div style={{ width: '260px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                                    <span style={{ color: '#64748b' }}>Subtotal</span>
                                    <span style={{ color: '#475569', fontWeight: '500' }}>₹{viewingOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                                    <span style={{ color: '#64748b' }}>GST (18%)</span>
                                    <span style={{ color: '#475569', fontWeight: '500' }}>₹{viewingOrder.tax.toFixed(2)}</span>
                                </div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    paddingTop: '14px', marginTop: '8px', borderTop: '2px solid #0f172a',
                                }}>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Total</span>
                                    <span style={{
                                        fontSize: '20px', fontWeight: '700',
                                        background: 'linear-gradient(135deg, #059669, #0d9488)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                    }}>₹{viewingOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions - only for pending */}
                    {viewingOrder.status === 'pending' && (
                        <div style={{
                            padding: '24px 32px', background: '#f8fafc',
                            borderTop: '1px solid #f1f5f9',
                        }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                                Process Order
                            </h3>
                            <div style={{ marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="Add a note (optional)..."
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        background: '#ffffff', border: '1px solid rgba(226,232,240,0.8)',
                                        borderRadius: '10px', fontSize: '13px', color: '#0f172a',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleStatusUpdate(viewingOrder._id, 'accepted')}
                                    disabled={processing === viewingOrder._id + 'accepted'}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                                        color: '#ffffff', fontSize: '14px', fontWeight: '600',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    <CheckCircle size={17} />
                                    {processing === viewingOrder._id + 'accepted' ? 'Accepting...' : 'Accept Order'}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(viewingOrder._id, 'rejected')}
                                    disabled={processing === viewingOrder._id + 'rejected'}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        background: 'rgba(239,68,68,0.06)', color: '#ef4444',
                                        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    <XCircle size={17} />
                                    {processing === viewingOrder._id + 'rejected' ? 'Rejecting...' : 'Reject Order'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Processed info */}
                    {viewingOrder.status !== 'pending' && viewingOrder.acceptedBy && (
                        <div style={{
                            padding: '16px 32px', background: '#f8fafc',
                            borderTop: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b',
                        }}>
                            Processed by <strong style={{ color: '#0f172a' }}>{viewingOrder.acceptedBy.name || 'Staff'}</strong>
                            {viewingOrder.statusNote && (
                                <span> — "{viewingOrder.statusNote}"</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── Loading ───
    if (loading) return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '60vh', gap: '12px',
        }}>
            <div style={{
                width: '32px', height: '32px',
                border: '3px solid rgba(5,150,105,0.15)', borderTopColor: '#059669',
                borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite',
            }} />
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading orders...</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Order Management
                </h1>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                    Review and process customer orders
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
            }}>
                {[
                    { label: 'Total Orders', value: stats.total, color: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
                    { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
                    { label: 'Accepted', value: stats.accepted, color: '#059669', bg: 'rgba(5,150,105,0.06)' },
                    { label: 'Rejected', value: stats.rejected, color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: '#ffffff', padding: '20px',
                        borderRadius: '14px', border: '1px solid rgba(226,232,240,0.6)',
                    }}>
                        <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginBottom: '6px' }}>{stat.label}</p>
                        <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
                {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: `Pending (${stats.pending})` },
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'rejected', label: 'Rejected' },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: '8px 18px', borderRadius: '10px', border: 'none',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        background: filter === f.key ? '#ffffff' : 'transparent',
                        color: filter === f.key ? '#0f172a' : '#64748b',
                        boxShadow: filter === f.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.2s ease',
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Orders list */}
            <div style={{
                background: '#ffffff', borderRadius: '16px',
                border: '1px solid rgba(226,232,240,0.6)', overflow: 'hidden',
            }}>
                {filteredOrders.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <ClipboardList size={48} style={{ color: '#e2e8f0', margin: '0 auto 16px', display: 'block' }} />
                        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>No orders found</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                            {filter !== 'all' ? 'Try changing the filter.' : 'Orders will appear when customers place them.'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Table header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1.2fr 0.8fr 1fr 0.8fr 1fr',
                            padding: '14px 24px',
                            background: '#f8fafc',
                            borderBottom: '1px solid #f1f5f9',
                        }}>
                            {['Order', 'Customer', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                                <span key={h} style={{
                                    fontSize: '11px', fontWeight: '600', color: '#94a3b8',
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                }}>{h}</span>
                            ))}
                        </div>

                        {filteredOrders.map(order => (
                            <div key={order._id} style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1.2fr 0.8fr 1fr 0.8fr 1fr',
                                padding: '18px 24px',
                                borderBottom: '1px solid #f8fafc',
                                alignItems: 'center',
                                transition: 'background 0.15s ease',
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfd'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Order number */}
                                <div>
                                    <span style={{
                                        fontSize: '13px', fontWeight: '700', color: '#0f172a',
                                        fontFamily: "'SF Mono', monospace",
                                    }}>
                                        {order.orderNumber}
                                    </span>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                </div>

                                {/* Customer */}
                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                                    {order.customerName}
                                </span>

                                {/* Items count */}
                                <span style={{ fontSize: '13px', color: '#64748b' }}>
                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </span>

                                {/* Total */}
                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                                    ₹{order.total.toFixed(2)}
                                </span>

                                {/* Status */}
                                <StatusBadge status={order.status} />

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setViewingOrder(order)} style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        padding: '6px 12px', borderRadius: '8px',
                                        border: '1px solid rgba(226,232,240,0.8)',
                                        background: '#ffffff', fontSize: '12px', fontWeight: '500',
                                        color: '#475569', cursor: 'pointer',
                                    }}>
                                        <Eye size={13} /> View
                                    </button>
                                    {order.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'accepted')}
                                                disabled={processing === order._id + 'accepted'}
                                                style={{
                                                    display: 'flex', alignItems: 'center',
                                                    padding: '6px 10px', borderRadius: '8px', border: 'none',
                                                    background: 'rgba(5,150,105,0.08)', color: '#059669',
                                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                }}
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'rejected')}
                                                disabled={processing === order._id + 'rejected'}
                                                style={{
                                                    display: 'flex', alignItems: 'center',
                                                    padding: '6px 10px', borderRadius: '8px', border: 'none',
                                                    background: 'rgba(239,68,68,0.06)', color: '#ef4444',
                                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                }}
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
