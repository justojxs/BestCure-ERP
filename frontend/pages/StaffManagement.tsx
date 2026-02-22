import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, Trash2, Shield, Mail, Lock } from 'lucide-react';

export default function StaffManagement() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New staff form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await api.getStaff();
            setStaffList(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await api.createStaff(name, email, password);
            setName('');
            setEmail('');
            setPassword('');
            await fetchStaff();
        } catch (err) {
            setError(err.message || 'Failed to create staff account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStaff = async (id: string, staffEmail: string) => {
        if (staffEmail === 'ojas@bestcure.com') {
            alert("Cannot delete the demo staff account.");
            return;
        }

        if (!window.confirm(`Are you sure you want to remove ${staffEmail}?`)) return;

        try {
            await api.deleteStaff(id);
            await fetchStaff();
        } catch (err) {
            alert(err.message || 'Failed to delete staff');
        }
    };

    return (
        <div className="flex-col gap-8" style={{ padding: '24px' }}>
            <div className="page-header animate-fadeIn" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>Staff Management</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-slate-500)' }}>Manage clinic staff accounts and access</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* Create Staff Form */}
                <div className="card animate-slideUp" style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} color="#3b82f6" /> Add New Staff
                    </h3>

                    <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {error && (
                            <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                                    placeholder="staff@clinic.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                marginTop: '8px', padding: '12px', background: '#3b82f6', color: 'white', border: 'none',
                                borderRadius: '6px', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Plus size={18} /> {isSubmitting ? 'Creating...' : 'Create Staff Account'}
                        </button>
                    </form>
                </div>

                {/* Staff List */}
                <div className="card animate-slideUp stagger-1" style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} color="#10b981" /> Active Staff Members
                    </h3>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                    ) : staffList.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No staff members found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Name</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Email</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Role</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map((staff) => (
                                        <tr key={staff._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px', fontWeight: '500' }}>{staff.name}</td>
                                            <td style={{ padding: '16px', color: '#475569' }}>{staff.email}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ padding: '4px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleDeleteStaff(staff._id, staff.email)}
                                                    style={{
                                                        background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                                                        opacity: staff.email === 'ojas@bestcure.com' ? 0.3 : 1
                                                    }}
                                                    disabled={staff.email === 'ojas@bestcure.com'}
                                                    title={staff.email === 'ojas@bestcure.com' ? "Cannot remove demo account" : "Remove staff"}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
