import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Users, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import BestCureLogo from '../components/BestCureLogo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
    const result = await login(email, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('bestcure_user'));
      navigate(user.role === 'customer' ? '/portal' : '/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  const fillCredentials = (role) => {
    const creds = {
      admin: { email: 'umesh@bestcure.com', password: 'demo1234' },
      staff: { email: 'ojas@bestcure.com', password: 'demo1234' },
      customer: { email: 'happypaws@clinic.com', password: 'demo1234' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  const demoCards = [
    { role: 'admin', icon: () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>, label: 'Admin', desc: 'Full access', color: '#059669', bg: 'rgba(5, 150, 105, 0.08)' },
    { role: 'staff', icon: User, label: 'Staff', desc: 'Operations', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
    { role: 'customer', icon: Users, label: 'Clinic', desc: 'Ordering', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
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
          </div>

          {/* Form */}
          <div style={{ padding: '8px 40px 40px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                  marginTop: 'var(--space-1)',
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

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '28px 0 20px',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'rgba(148,163,184,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Sparkles size={12} /> Demo Access
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Demo buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {demoCards.map((card) => (
                <button
                  key={card.role}
                  id={`demo-${card.role}`}
                  onClick={() => fillCredentials(card.role)}
                  className="btn"
                  style={{
                    padding: '14px 8px',
                    background: card.bg,
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-md)',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <card.icon size={20} style={{ color: card.color }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#e2e8f0' }}>{card.label}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.6)' }}>{card.desc}</span>
                </button>
              ))}
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