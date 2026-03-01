import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Users, Lock, Mail, ShieldCheck, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import BestCureLogo from '../components/BestCureLogo';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'admin' | 'staff' | 'customer'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEmail('');
    setPassword('');
    setError('');
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('bestcure_user') || '{}');
      navigate(user.role === 'customer' ? '/portal' : '/dashboard');
    } else {
      setError('Invalid credentials. Please verify and try again.');
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
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: '#0f172a' },
    { id: 'staff', label: 'Staff', icon: User, color: '#0f172a' },
    { id: 'customer', label: 'Customer', icon: Users, color: '#0f172a' }
  ];

  return (
    <>
      <style>{`
        .login-layout {
          min-height: 100vh;
          display: flex;
          background: var(--surface-bg);
        }
        .login-right-panel {
          display: none;
        }
        @media (min-width: 1024px) {
          .login-right-panel {
            display: block;
            flex: 1.3;
          }
          .login-left-panel {
            flex: 1;
            max-width: 550px;
            border-right: 1px solid var(--surface-border);
            background: var(--surface-card);
          }
        }
      `}</style>

      <div className="login-layout">
        {/* LEFT: Login Form Side */}
        <div className="login-left-panel" style={{
          flex: '1', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', padding: '40px',
          position: 'relative'
        }}>
          <div style={{
            width: '100%', maxWidth: '400px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Brand Header */}
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BestCureLogo variant="icon" size={42} />
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>Best<span style={{ color: 'var(--color-primary)' }}>Cure</span></h2>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-slate-500)', letterSpacing: '1px', textTransform: 'uppercase' }}>ERP System</p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-slate-900)', marginBottom: '8px', letterSpacing: '-1px' }}>
                Secure Access
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-slate-500)' }}>
                Select your portal and sign in to continue.
              </p>
            </div>

            {/* Role Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--surface-bg)', padding: '6px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1, padding: '10px',
                    background: activeTab === tab.id ? 'var(--surface-card)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === tab.id ? 'var(--color-slate-900)' : 'var(--color-slate-400)',
                    fontWeight: activeTab === tab.id ? 700 : 600,
                    fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: activeTab === tab.id ? '0 2px 8px rgba(15,23,42,0.08)' : 'none',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px', background: 'var(--surface-bg)', border: '1px solid var(--color-primary)', borderRadius: '10px', color: 'var(--color-slate-600)', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontWeight: '500', lineHeight: 1.5 }}>
                <Info size={18} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong style={{ color: 'var(--color-slate-900)' }}>Demo Tester Note:</strong> The backend of this website is deployed on a free Render instance. It may take <strong>20-25 seconds</strong> to wake up from a cold start upon initial authentication. Please be patient!</span>
              </div>

              {error && (
                <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                  <CheckCircle2 size={16} /> {error}
                </div>
              )}

              {/* Quick Demo Credentials Autofill */}
              <div style={{ textAlign: 'center', marginBottom: '-8px' }}>
                <span
                  onClick={fillCredentials}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 16px', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600', color: 'var(--color-slate-500)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-slate-100)'; e.currentTarget.style.color = 'var(--color-slate-900)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface-bg)'; e.currentTarget.style.color = 'var(--color-slate-500)'; }}
                >
                  <CheckCircle2 size={14} /> Click here to autofill Demo {activeTab}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-slate-700)', marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} size={18} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    style={{
                      width: '100%', padding: '14px 16px 14px 46px',
                      border: '1.5px solid var(--surface-border)', borderRadius: '12px',
                      fontSize: '15px', color: 'var(--color-slate-800)', background: 'var(--surface-card)',
                      outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-100)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-slate-700)', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '14px 16px 14px 46px',
                      border: '1.5px solid var(--surface-border)', borderRadius: '12px',
                      fontSize: '15px', color: 'var(--color-slate-800)', background: 'var(--surface-card)',
                      outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-100)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', marginTop: '8px',
                  background: loading ? 'var(--color-slate-300)' : 'var(--color-slate-900)',
                  color: 'var(--surface-bg)', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(0,0,0,0.15)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-slate-800)'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-slate-900)'; }}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Authenticating...</>
                ) : (
                  <>Sign In <ChevronRight size={18} /></>
                )}
              </button>
            </form>

            {activeTab === 'customer' && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-slate-500)' }}>
                  Don't have a retail account?{' '}
                  <a onClick={() => navigate('/signup')} style={{ color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' }}>
                    Register here
                  </a>
                </p>
              </div>
            )}

          </div>

          <div style={{ position: 'absolute', bottom: '28px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-slate-400)', fontWeight: '500', letterSpacing: '0.3px', display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              Designed & Maintained with <span style={{ color: '#ef4444', fontSize: '15px' }}>❤️</span> by{' '}
              <span style={{ fontWeight: '700', color: 'var(--color-slate-600)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                Ojas Gupta
                <a
                  href="https://www.linkedin.com/in/ojas-gupta-aa6443206/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ojas Gupta LinkedIn Profile"
                  style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-slate-400)', transition: 'all 0.25s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#0a66c2'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-slate-400)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </span>
            </p>
          </div>
        </div>

        {/* RIGHT: Visual Side */}
        <div className="login-right-panel" style={{
          position: 'relative', overflow: 'hidden', background: '#0f172a'
        }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <img src="/images/login-bg.png" alt="Veterinary Clinic Enterprise" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: mounted ? 'scale(1)' : 'scale(1.03)', transition: 'transform 3s ease-out', opacity: 0.9 }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,145,178,0.85) 0%, rgba(15,23,42,0.95) 100%)' }} />

          <div style={{
            position: 'relative', zIndex: 1, padding: '80px', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <div style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}>
              <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: 1.15, color: '#f8fafc', marginBottom: '24px', letterSpacing: '-1.5px' }}>
                Welcome to BestCure ERP.<br />
                <span style={{ color: '#34d399' }}>The Future of Veterinary.</span>
              </h1>

              <p style={{ fontSize: '20px', fontWeight: '400', lineHeight: 1.6, color: 'rgba(248,250,252,0.8)', maxWidth: '600px', marginBottom: '48px' }}>
                Powering modern clinics and wholesale partners with intelligent, real-time inventory management and seamless stock fulfillment.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '560px' }}>
                <div style={{ paddingLeft: '16px', borderLeft: '3px solid rgba(52,211,153,0.5)' }}>
                  <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Take Control Easily</h4>
                  <p style={{ color: 'rgba(248,250,252,0.6)', fontSize: '14px', lineHeight: 1.4 }}>Manage medicines and track batches entirely automatically.</p>
                </div>
                <div style={{ paddingLeft: '16px', borderLeft: '3px solid rgba(14,165,233,0.5)' }}>
                  <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Everything in One Place</h4>
                  <p style={{ color: 'rgba(248,250,252,0.6)', fontSize: '14px', lineHeight: 1.4 }}>Unify your billing, tracking, and staff in one fast system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}