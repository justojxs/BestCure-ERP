import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    FileText, Download, Eye, Clock, ArrowLeft,
    CheckCircle, XCircle, Package, Search
} from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';

// ─── Status Badge ───
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

// ─── Main Component ───
export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [printingOrder, setPrintingOrder] = useState(null);

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

    const handlePrint = (order) => {
        setPrintingOrder(order);
        // Delay to allow DOM to render the invoice template
        setTimeout(() => {
            window.print();
            // Optional: reset printing order after delay, though keeping it invisible shouldn't hurt
        }, 500);
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'all' || o.status === filter;
        const matchesSearch = searchTerm === '' ||
            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        rejected: orders.filter(o => o.status === 'rejected').length,
    };

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
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading order history...</span>
        </div>
    );

    // ─── Order Detail View ───
    if (viewingOrder) {
        return (
            <div className="no-print-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <button onClick={() => setViewingOrder(null)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: 'none', color: '#64748b', fontSize: '14px',
                    fontWeight: '500', cursor: 'pointer', padding: 0,
                }}>
                    <ArrowLeft size={18} /> Back to Order History
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
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
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
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Invoice Details</h2>
                            <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.7)' }}>
                                {new Date(viewingOrder.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <StatusBadge status={viewingOrder.status} size="lg" />
                            {viewingOrder.status === 'accepted' && (
                                <button onClick={() => handlePrint(viewingOrder)} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    marginTop: '12px', padding: '8px 16px',
                                    background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)',
                                    borderRadius: '10px', color: '#34d399', fontSize: '12px',
                                    fontWeight: '600', cursor: 'pointer',
                                }}>
                                    <Download size={14} /> Download Invoice
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ padding: '24px 32px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {['Item', 'Qty', 'Price', 'Total'].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 0', fontSize: '11px', fontWeight: '600',
                                            color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px',
                                            textAlign: h === 'Item' ? 'left' : 'right',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {viewingOrder.items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '14px 0' }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{item.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.batch}</div>
                                        </td>
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
                                    paddingTop: '14px', marginTop: '8px',
                                    borderTop: '2px solid #0f172a',
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
                </div>
                {/* Print Template Injection */}
                <div className="printable-invoice" style={{ display: 'none' }}>
                    <InvoiceTemplate order={printingOrder || viewingOrder} />
                </div>
            </div>
        );
    }

    // ─── Order History Main View ───
    return (
        <div className="no-print-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Order History
                </h1>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                    Track your orders and download invoices
                </p>
            </div>

            {/* Stats */}
            <div className="grid-4">
                {[
                    { label: 'Total Orders', value: stats.total, color: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
                    { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
                    { label: 'Accepted', value: stats.accepted, color: '#059669', bg: 'rgba(5,150,105,0.06)' },
                    { label: 'Rejected', value: stats.rejected, color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: '#ffffff', padding: '18px 20px',
                        borderRadius: '14px', border: '1px solid rgba(226,232,240,0.6)',
                    }}>
                        <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginBottom: '4px' }}>{stat.label}</p>
                        <p style={{ fontSize: '26px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter + Search row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'pending', label: `Pending (${stats.pending})` },
                        { key: 'accepted', label: 'Accepted' },
                        { key: 'rejected', label: 'Rejected' },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none',
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

                <div style={{ position: 'relative', minWidth: '240px' }}>
                    <Search style={{
                        position: 'absolute', left: '12px', top: '50%',
                        transform: 'translateY(-50%)', color: '#94a3b8',
                    }} size={16} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        style={{
                            width: '100%', padding: '9px 14px 9px 38px',
                            borderRadius: '10px', border: '1px solid rgba(226,232,240,0.8)',
                            background: '#ffffff', color: '#0f172a', fontSize: '13px', outline: 'none',
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Orders List */}
            <div style={{
                background: '#ffffff', borderRadius: '16px',
                border: '1px solid rgba(226,232,240,0.6)', overflow: 'hidden',
            }}>
                {filteredOrders.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <FileText size={48} style={{ color: '#e2e8f0', margin: '0 auto 16px', display: 'block' }} />
                        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>
                            {filter !== 'all' || searchTerm ? 'No matching orders' : 'No orders yet'}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                            {filter !== 'all' || searchTerm
                                ? 'Try changing the filter or search term.'
                                : 'Your placed orders will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filteredOrders.map(order => (
                            <div key={order._id} style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid #f8fafc',
                                transition: 'background 0.15s ease',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfd'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                onClick={() => setViewingOrder(order)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{
                                                fontSize: '14px', fontWeight: '700', color: '#0f172a',
                                                fontFamily: "'SF Mono', monospace",
                                            }}>
                                                {order.orderNumber}
                                            </span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                            {' · '}{order.items.length} item{order.items.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            fontSize: '18px', fontWeight: '700',
                                            background: 'linear-gradient(135deg, #059669, #0d9488)',
                                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                        }}>₹{order.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {order.items.slice(0, 3).map((itm, i) => (
                                        <span key={i} style={{
                                            padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px',
                                            fontSize: '11px', color: '#475569', fontWeight: '500',
                                        }}>
                                            {itm.name} ×{itm.quantity}
                                        </span>
                                    ))}
                                    {order.items.length > 3 && (
                                        <span style={{
                                            padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px',
                                            fontSize: '11px', color: '#94a3b8', fontWeight: '500',
                                        }}>
                                            +{order.items.length - 3} more
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); setViewingOrder(order); }} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(226,232,240,0.8)',
                                        background: '#fff', fontSize: '12px', fontWeight: '500',
                                        color: '#475569', cursor: 'pointer',
                                    }}>
                                        <Eye size={13} /> View Details
                                    </button>
                                    {order.status === 'accepted' && (
                                        <button onClick={(e) => { e.stopPropagation(); handlePrint(order); }} style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 14px', borderRadius: '8px',
                                            background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)',
                                            fontSize: '12px', fontWeight: '600', color: '#059669', cursor: 'pointer',
                                        }}>
                                            <Download size={13} /> Download Invoice
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Injection for Main List View Printing if needed (usually only needed inside detail view or passing state) */}
            <div className="printable-invoice" style={{ display: 'none' }}>
                <InvoiceTemplate order={printingOrder} />
            </div>
        </div>
    );
}
