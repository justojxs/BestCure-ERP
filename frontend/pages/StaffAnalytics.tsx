import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3, TrendingUp, Users, Calendar,
    Activity, FileText, IndianRupee, ShieldCheck
} from 'lucide-react';

export default function StaffAnalytics() {
    const { user } = useAuth();
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const response = await api.getStaffPerformance();
                if (response.success) {
                    setPerformanceData(response.data);
                }
            } catch (err) {
                setError(err.message || 'Failed to load staff performance data');
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, []);

    const isStaff = user?.role === 'staff';
    const activeData = isStaff && performanceData.length > 0 ? performanceData[0] : null;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <span className="loading-text">Loading Analytics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
            </div>
        );
    }

    if (isStaff && !activeData) {
        return (
            <div className="flex-col gap-8" style={{ padding: '24px' }}>
                <div className="page-header animate-fadeIn">
                    <div>
                        <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>My Performance</h1>
                        <p className="page-subtitle" style={{ color: 'var(--color-slate-500)' }}>Analytics based on invoices created by you</p>
                    </div>
                </div>
                <div className="empty-state card animate-slideUp">
                    <Activity size={48} color="#94a3b8" />
                    <p style={{ color: '#64748b', marginTop: '16px' }}>You haven't generated any invoices yet.</p>
                </div>
            </div>
        );
    }

    // Individual Staff View
    if (isStaff && activeData) {
        return (
            <div className="flex-col gap-8" style={{ padding: '24px', paddingBottom: '60px' }}>
                <div className="page-header animate-fadeIn" style={{ marginBottom: '12px' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>My Performance</h1>
                        <p className="page-subtitle" style={{ color: 'var(--color-slate-500)' }}>Your overall impact on generating invoices</p>
                    </div>
                    <div className="badge badge-info flex items-center gap-2">
                        <BarChart3 size={14} /> Tracking Live
                    </div>
                </div>

                <div className="grid-3">
                    <div className="stat-card card animate-slideUp" style={{ '--stat-accent': '#3b82f6', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' } as React.CSSProperties}>
                        <div className="stat-card-header">
                            <div className="stat-card-icon" style={{ background: `rgba(59, 130, 246, 0.1)`, color: '#3b82f6' }}>
                                <FileText size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <p className="stat-card-label" style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginTop: '16px' }}>Invoices Generated</p>
                            <h3 className="stat-card-value" style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>
                                {activeData.invoicesGenerated}
                            </h3>
                            <p className="stat-card-subtext" style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Total orders you've created</p>
                        </div>
                    </div>

                    <div className="stat-card card animate-slideUp stagger-1" style={{ '--stat-accent': '#10b981', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' } as React.CSSProperties}>
                        <div className="stat-card-header">
                            <div className="stat-card-icon" style={{ background: `rgba(16, 185, 129, 0.1)`, color: '#10b981' }}>
                                <IndianRupee size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <p className="stat-card-label" style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginTop: '16px' }}>Total Revenue Generated</p>
                            <h3 className="stat-card-value" style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>
                                ₹{activeData.totalRevenue?.toLocaleString()}
                            </h3>
                            <p className="stat-card-subtext" style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Cumulated from all your invoices</p>
                        </div>
                    </div>

                    <div className="stat-card card animate-slideUp stagger-2" style={{ '--stat-accent': '#8b5cf6', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' } as React.CSSProperties}>
                        <div className="stat-card-header">
                            <div className="stat-card-icon" style={{ background: `rgba(139, 92, 246, 0.1)`, color: '#8b5cf6' }}>
                                <TrendingUp size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <p className="stat-card-label" style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginTop: '16px' }}>Average Invoice Value</p>
                            <h3 className="stat-card-value" style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>
                                ₹{activeData.averageInvoiceValue?.toLocaleString()}
                            </h3>
                            <p className="stat-card-subtext" style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Per order performance</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin View
    return (
        <div className="flex-col gap-8" style={{ padding: '24px', paddingBottom: '60px' }}>
            <div className="page-header animate-fadeIn" style={{ marginBottom: '12px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>Staff Analytics</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-slate-500)' }}>Detailed performance insights across all staff accounts</p>
                </div>
                <div className="badge badge-primary flex items-center gap-2">
                    <ShieldCheck size={14} /> Admin Overview
                </div>
            </div>

            {performanceData.length === 0 ? (
                <div className="empty-state card animate-slideUp">
                    <Activity size={48} color="#94a3b8" />
                    <p style={{ color: '#64748b', marginTop: '16px' }}>No staff invoices have been generated yet.</p>
                </div>
            ) : (
                <div className="card animate-slideUp" style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Staff Member</th>
                                    <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Invoices Created</th>
                                    <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Total Revenue</th>
                                    <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Avg Invoice Value</th>
                                    <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Latest Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceData.map((staff, i) => (
                                    <tr key={staff._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '8px',
                                                    background: '#eff6ff', color: '#3b82f6',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {staff.name?.charAt(0) || <Users size={16} />}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{staff.name}</p>
                                                    <p style={{ fontSize: '12px', color: '#64748b' }}>{staff.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                                                {staff.invoicesGenerated}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: '700', color: '#10b981' }}>
                                                ₹{staff.totalRevenue?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#475569', fontWeight: '500' }}>
                                            ₹{staff.averageInvoiceValue?.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontSize: '14px' }}>
                                            {staff.lastInvoiceDate
                                                ? new Date(staff.lastInvoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : 'No Activity'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
