import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, Shield, Calendar, Package,
    Building2, Phone, MapPin, Clock
} from 'lucide-react';

// Customer account page — shows profile info, account details, and support contact
// In a production app, this would allow editing profile and changing passwords

export default function Account() {
    const { user } = useAuth();
    const memberSince = 'January 2026';
    const accountType = user?.role === 'customer' ? 'Wholesale Partner' : 'Internal Staff';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    My Account
                </h1>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                    View your profile information and account settings
                </p>
            </div>

            {/* Profile Card */}
            <div style={{
                background: '#fff', borderRadius: '20px',
                border: '1px solid rgba(226,232,240,0.6)',
                overflow: 'hidden',
            }}>
                {/* Profile banner */}
                <div style={{
                    height: '100px',
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)',
                    position: 'relative',
                }}>
                    <div style={{
                        position: 'absolute', bottom: '-36px', left: '28px',
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: '#fff', border: '4px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}>
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #059669, #0d9488)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '24px', fontWeight: '700',
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '48px 28px 24px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{user?.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                            background: 'rgba(5,150,105,0.08)', color: '#059669',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                            <Shield size={12} /> {accountType}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> Member since {memberSince}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>

                {/* Contact Information */}
                <div style={{
                    background: '#fff', borderRadius: '16px',
                    border: '1px solid rgba(226,232,240,0.6)',
                    padding: '24px',
                }}>
                    <h3 style={{
                        fontSize: '14px', fontWeight: '700', color: '#0f172a',
                        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
                    }}>
                        <User size={18} style={{ color: '#059669' }} /> Contact Information
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Mail size={16} style={{ color: '#64748b' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Email Address</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{user?.email}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Shield size={16} style={{ color: '#64748b' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Account Role</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' }}>{user?.role}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Building2 size={16} style={{ color: '#64748b' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Organization</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{user?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support & Help */}
                <div style={{
                    background: '#fff', borderRadius: '16px',
                    border: '1px solid rgba(226,232,240,0.6)',
                    padding: '24px',
                }}>
                    <h3 style={{
                        fontSize: '14px', fontWeight: '700', color: '#0f172a',
                        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
                    }}>
                        <Phone size={18} style={{ color: '#059669' }} /> Support & Help
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{
                            padding: '14px', borderRadius: '12px',
                            background: '#f8fafc', border: '1px solid rgba(226,232,240,0.4)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Phone size={14} style={{ color: '#059669' }} />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Customer Support</span>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>+91 98765 43210</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Mon-Sat, 9 AM - 6 PM IST</p>
                        </div>

                        <div style={{
                            padding: '14px', borderRadius: '12px',
                            background: '#f8fafc', border: '1px solid rgba(226,232,240,0.4)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Mail size={14} style={{ color: '#059669' }} />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Email Support</span>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>support@bestcure.com</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Response within 24 hours</p>
                        </div>

                        <div style={{
                            padding: '14px', borderRadius: '12px',
                            background: '#f8fafc', border: '1px solid rgba(226,232,240,0.4)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <MapPin size={14} style={{ color: '#059669' }} />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Office Address</span>
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                                BestCure Veterinary Distributors
                            </p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                123, Nehru Place, New Delhi - 110019
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '16px', padding: '24px',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px',
            }}>
                {[
                    { label: 'Account Status', value: 'Active', icon: Shield, color: '#34d399' },
                    { label: 'Business Hours', value: '9AM-6PM', icon: Clock, color: '#60a5fa' },
                    { label: 'Delivery Zone', value: 'Pan India', icon: MapPin, color: '#fbbf24' },
                    { label: 'Credit Limit', value: '₹50,000', icon: Package, color: '#a78bfa' },
                ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                        <stat.icon size={20} style={{ color: stat.color, margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{stat.value}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
