import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import BestCureLogo from '../components/BestCureLogo';
import { api } from '../services/api';

export default function Signup() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.signup(name, email, password);
            if (response && response.token) {
                // Log them in natively
                const loginResult = await login(email, password);
                if (loginResult.success) {
                    navigate('/portal');
                } else {
                    setError('Signup successful, but auto-login failed. Please login manually.');
                }
            }
        } catch (err) {
            setError(err.message || 'Error occurred during signup');
        }

        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 'var(--space-6)',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Animated background orbs */}
            {[
                { top: '-20%', left: '-10%', size: 600, color: '16,185,129', opacity: 0.15, dur: '8s' },
                { bottom: '-15%', right: '-5%', size: 500, color: '14,165,233', opacity: 0.12, dur: '10s', reverse: true },
                { top: '30%', right: '20%', size: 300, color: '139,92,246', opacity: 0.08, dur: '12s' },
            ].map((orb, i) => (
                <div key={i} style={{
                    position: 'absolute', ...orb,
                    width: orb.size, height: orb.size,
                    background: `radial-gradient(circle, rgba(${orb.color},${orb.opacity}) 0%, transparent 70%)`,
                    borderRadius: '50%',
                    animation: `float ${orb.dur} ease-in-out infinite ${orb.reverse ? 'reverse' : ''}`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* Grid pattern */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            <div style={{
                maxWidth: 440, width: '100%', position: 'relative', zIndex: 1,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {/* Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '48px 40px 36px', textAlign: 'center',
                        background: 'linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 100%)',
                    }}>
                        <BestCureLogo variant="full" size={64} />
                        <p style={{ color: 'rgba(148,163,184,0.7)', marginTop: '16px', fontSize: '14px' }}>
                            Create your customer account
                        </p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '8px 40px 40px' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {error && (
                                <div className="alert alert-error" style={{ justifyContent: 'center' }}>
                                    {error}
                                </div>
                            )}

                            {/* Name */}
                            <div style={{ position: 'relative' }}>
                                <User style={{
                                    position: 'absolute', left: 16, top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'rgba(148,163,184,0.5)',
                                }} size={18} />
                                <input
                                    id="signup-name"
                                    type="text"
                                    placeholder="Full Name"
                                    className="form-input form-input-dark"
                                    style={{ paddingLeft: 48 }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div style={{ position: 'relative' }}>
                                <Mail style={{
                                    position: 'absolute', left: 16, top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'rgba(148,163,184,0.5)',
                                }} size={18} />
                                <input
                                    id="signup-email"
                                    type="email"
                                    placeholder="Email address"
                                    className="form-input form-input-dark"
                                    style={{ paddingLeft: 48 }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password */}
                            <div style={{ position: 'relative' }}>
                                <Lock style={{
                                    position: 'absolute', left: 16, top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'rgba(148,163,184,0.5)',
                                }} size={18} />
                                <input
                                    id="signup-password"
                                    type="password"
                                    placeholder="Password"
                                    className="form-input form-input-dark"
                                    style={{ paddingLeft: 48 }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary btn-lg"
                                style={{
                                    background: loading
                                        ? 'rgba(5,150,105,0.5)'
                                        : 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                                    marginTop: 'var(--space-1)',
                                }}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                        Creating Account...
                                    </span>
                                ) : (
                                    <>Sign Up <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '14px' }}>
                                Already have an account?{' '}
                                <a onClick={() => navigate('/login')} style={{ color: '#0d9488', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Sign in
                                </a>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center', marginTop: 'var(--space-6)',
                    fontSize: 'var(--text-xs)', color: 'rgba(148,163,184,0.3)',
                }}>
                    © 2026 BestCure · Veterinary Medicine Distribution
                </p>
            </div>
        </div>
    );
}
