import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Users, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import BestCureLogo from '../components/BestCureLogo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'admin' | 'staff' | 'customer'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear inputs when swapping tabs to avoid confusion
    setEmail('');
    setPassword('');
    setError('');
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('bestcure_user'));
      navigate(user.role === 'customer' ? '/portal' : '/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  const fillCredentials = () => {
    const creds = {
      admin: { email: 'umesh@bestcure.com', password: 'demo1234' },
      staff: { email: 'ojas@bestcure.com', password: 'demo1234' },
      customer: { email: 'happypaws@clinic.com', password: 'demo1234' },
    };
    setEmail(creds[activeTab].email);
    setPassword(creds[activeTab].password);
  };

  const tabs = [
    { id: 'admin', label: 'Admin Login', icon: ShieldCheck, color: '#059669' },
    { id: 'staff', label: 'Staff Login', icon: User, color: '#3b82f6' },
    { id: 'customer', label: 'Customer Login', icon: Users, color: '#8b5cf6' }
  ];

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
        maxWidth: 480, width: '100%', position: 'relative', zIndex: 1,
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

          {/* Main Logo Area */}
          <div style={{
            padding: '40px 40px 24px', textAlign: 'center',
          }}>
            <BestCureLogo variant="full" size={64} />
          </div>

          {/* Role Tabs */}
          <div style={{ padding: '0 40px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 8px',
                  background: activeTab === tab.id ? `${tab.color}20` : 'transparent',
                  border: `1px solid ${activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  color: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <tab.icon size={20} />
                <span style={{ fontSize: '12px', fontWeight: activeTab === tab.id ? 700 : 500 }}>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 40px' }} />

          {/* Form Area */}
          <div style={{ padding: '32px 40px 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', letterSpacing: '0.5px' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Login
              </h2>
              {/* Demo Hint */}
              <div
                onClick={fillCredentials}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  marginTop: '12px', padding: '8px 16px',
                  background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)',
                  borderRadius: '20px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              >
                <CheckCircle2 size={16} /> Click here to autofill Demo {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} credentials
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div className="alert alert-error" style={{ justifyContent: 'center' }}>
                  {error}
                </div>
              )}

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: 16, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(148,163,184,0.5)',
                }} size={18} />
                <input
                  id="login-email"
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
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  className="form-input form-input-dark"
                  style={{ paddingLeft: 48 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit */}
              <button
                id="btn-login"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{
                  background: loading
                    ? 'rgba(5,150,105,0.5)'
                    : 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                  marginTop: '8px',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {activeTab === 'customer' && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '14px' }}>
                  Don't have a customer account?{' '}
                  <a onClick={() => navigate('/signup')} style={{ color: '#0d9488', cursor: 'pointer', fontWeight: 'bold' }}>
                    Sign up here
                  </a>
                </span>
              </div>
            )}

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