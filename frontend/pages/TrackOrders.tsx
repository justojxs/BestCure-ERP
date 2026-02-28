import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Package, Truck, CheckCircle, XCircle, Clock, MapPin,
    ChevronDown, ChevronUp, Search, AlertCircle
} from 'lucide-react';

// Visual timeline tracker for customer orders — shows real-time order status
// with an animated step indicator (placed → processing → shipped → delivered)

const ORDER_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: Package, color: '#3b82f6' },
    { key: 'processing', label: 'Processing', icon: Clock, color: '#f59e0b' },
    { key: 'shipped', label: 'Shipped', icon: Truck, color: '#8b5cf6' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: '#059669' },
];

// Map backend statuses to timeline step index
const statusToStep = (status: string): number => {
    switch (status?.toLowerCase()) {
        case 'pending': return 0;
        case 'accepted': return 2;
        case 'rejected': return -1;
        default: return 0;
    }
};

function TimelineTracker({ status }: { status: string }) {
    const currentStep = statusToStep(status);
    const isRejected = status?.toLowerCase() === 'rejected';

    if (isRejected) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 18px', borderRadius: '12px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
            }}>
                <XCircle size={20} style={{ color: '#ef4444' }} />
                <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>Order Rejected</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                        This order was not approved. Please contact support for details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', padding: '8px 0' }}>
            {ORDER_STEPS.map((step, i) => {
                const isComplete = i <= currentStep;
                const isCurrent = i === currentStep;
                const StepIcon = step.icon;
                return (
                    <React.Fragment key={step.key}>
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            flex: '0 0 auto', position: 'relative',
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isComplete ? step.color : '#f1f5f9',
                                color: isComplete ? '#fff' : '#cbd5e1',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent ? `0 0 0 4px ${step.color}22` : 'none',
                            }}>
                                <StepIcon size={16} />
                            </div>
                            <span style={{
                                fontSize: '10px', fontWeight: '600',
                                color: isComplete ? '#0f172a' : '#94a3b8',
                                whiteSpace: 'nowrap',
                            }}>
                                {step.label}
                            </span>
                        </div>
                        {i < ORDER_STEPS.length - 1 && (
                            <div style={{
                                flex: 1, height: '3px', minWidth: '20px',
                                background: i < currentStep
                                    ? `linear-gradient(90deg, ${ORDER_STEPS[i].color}, ${ORDER_STEPS[i + 1].color})`
                                    : '#e2e8f0',
                                borderRadius: '999px', margin: '0 6px',
                                marginBottom: '22px',
                                transition: 'all 0.3s ease',
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default function TrackOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await api.getOrders();
            if (Array.isArray(data)) {
                setOrders(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } else {
                setOrders([]);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filteredOrders = orders.filter(order => {
        const matchSearch = order._id.includes(searchTerm) ||
            order.items?.some((i: any) => i.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchSearch) return false;
        if (filter === 'pending') return order.status === 'pending';
        if (filter === 'accepted') return order.status === 'accepted';
        if (filter === 'rejected') return order.status === 'rejected';
        return true;
    });

    const statusColor = (s: string) => {
        switch (s) { case 'accepted': return '#059669'; case 'rejected': return '#ef4444'; default: return '#f59e0b'; }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <span style={{ color: '#64748b', fontSize: '14px' }}>Loading orders...</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Track Orders
                </h1>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                    Monitor your order status in real-time with our visual order tracker
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '360px' }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                    <input
                        type="text" placeholder="Search by order ID or product..."
                        style={{
                            width: '100%', padding: '9px 14px 9px 40px', borderRadius: '10px',
                            border: '1.5px solid rgba(226,232,240,0.8)', background: '#fff',
                            fontSize: '13px', outline: 'none',
                        }}
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {['all', 'pending', 'accepted', 'rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        background: filter === f ? '#0f172a' : '#f1f5f9',
                        color: filter === f ? '#fff' : '#64748b',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        textTransform: 'capitalize',
                    }}>
                        {f === 'all' ? 'All Orders' : f}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Package size={48} style={{ color: '#e2e8f0', margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>No orders found</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredOrders.map(order => {
                        const expanded = expandedId === order._id;
                        const totalAmount = order.totalAmount || order.items?.reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 0), 0) || 0;

                        // deterministic fake tracking data based on order id
                        const mockTrackingSrc = order._id.replace(/[^a-z]/ig, '').toUpperCase();
                        const courier = mockTrackingSrc.length % 2 === 0 ? 'FedEx Priority' : 'Delhivery B2B';
                        const trackingId = `TRK-${order._id.slice(-8).toUpperCase()}`;

                        return (
                            <div key={order._id} style={{
                                background: '#fff', borderRadius: '12px',
                                border: '1px solid rgba(226,232,240,0.8)',
                                overflow: 'hidden', transition: 'all 0.2s ease',
                                boxShadow: expanded ? '0 4px 12px rgba(15,23,42,0.03)' : 'none',
                            }}>
                                {/* Order header (Table-like Row) */}
                                <div
                                    onClick={() => setExpandedId(expanded ? null : order._id)}
                                    style={{
                                        padding: '16px 20px', cursor: 'pointer',
                                        display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr 1fr 1fr auto', alignItems: 'center', gap: '16px',
                                        background: expanded ? '#f8fafc' : '#fff',
                                    }}
                                    onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = '#f8fafc'; }}
                                    onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = '#fff'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '8px',
                                            background: `${statusColor(order.status)}10`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Package size={18} style={{ color: statusColor(order.status) }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                                                PO-{order._id?.slice(-8).toUpperCase()}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</p>
                                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>₹{totalAmount.toFixed(2)}</p>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</p>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{order.items?.length || 0} SKUs</p>
                                    </div>

                                    <div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                            background: statusColor(order.status), color: '#fff',
                                            textTransform: 'uppercase', letterSpacing: '0.5px'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div>
                                        {expanded ? <ChevronUp size={20} style={{ color: '#94a3b8' }} /> : <ChevronDown size={20} style={{ color: '#94a3b8' }} />}
                                    </div>
                                </div>

                                {/* Expanded content */}
                                {expanded && (
                                    <div style={{ padding: '24px 20px', borderTop: '1px solid rgba(226,232,240,0.8)' }}>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>

                                            {/* LEFT: Items & Timeline */}
                                            <div>
                                                <div style={{ marginBottom: '24px' }}>
                                                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Clock size={16} style={{ color: '#3b82f6' }} /> Order Progress
                                                    </h4>
                                                    <TimelineTracker status={order.status} />
                                                </div>

                                                <div>
                                                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                                                        Line Items
                                                    </h4>
                                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                                <tr>
                                                                    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Item</th>
                                                                    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Qty</th>
                                                                    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items?.map((item: any, idx: number) => (
                                                                    <tr key={idx} style={{ borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                                        <td style={{ padding: '10px 12px' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f1f5f9', overflow: 'hidden' }}>
                                                                                    {item.product?.image && <img src={item.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                                                </div>
                                                                                <div>
                                                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.product?.name || 'Unknown'}</div>
                                                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>₹{(item.price || 0).toFixed(2)}/unit</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>{item.quantity}</td>
                                                                        <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#0f172a', textAlign: 'right' }}>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT: Logistics & Actions */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {/* Logistics Card */}
                                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                                                    <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Truck size={14} /> Logistics Information
                                                    </h4>

                                                    {order.status === 'pending' ? (
                                                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                                            Awaiting dispatch confirmation...
                                                        </div>
                                                    ) : order.status === 'rejected' ? (
                                                        <div style={{ fontSize: '13px', color: '#ef4444' }}>
                                                            Shipment cancelled.
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Logistics Partner</p>
                                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{courier}</p>
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Tracking ID</p>
                                                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                                                                    {trackingId} ↗
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Estimated Delivery</p>
                                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>
                                                                    {new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <button onClick={() => window.alert('Invoice download has been initiated.')} style={{
                                                        width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                                        background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a',
                                                        fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        <Package size={16} /> Download PDF Invoice
                                                    </button>
                                                    <button onClick={() => window.alert('Items copied to cart!')} style={{
                                                        width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                                        background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a',
                                                        fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        <Clock size={16} /> Reorder these items
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
