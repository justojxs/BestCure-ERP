import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Users, Lock, Mail, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
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
          background: #ffffff;
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
            border-right: 1px solid #e2e8f0;
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
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BestCureLogo variant="icon" size={42} />
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Best<span style={{ color: '#059669' }}>Cure</span></h2>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>ERP System</p>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing: '-1px' }}>
                Secure Access
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Select your portal and sign in to continue.
              </p>
            </div>

            {/* Role Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1, padding: '10px',
                    background: activeTab === tab.id ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === tab.id ? tab.color : '#94a3b8',
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
                    padding: '6px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <CheckCircle2 size={14} /> Click here to autofill Demo {activeTab}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    style={{
                      width: '100%', padding: '14px 16px 14px 46px',
                      border: '1.5px solid #e2e8f0', borderRadius: '12px',
                      fontSize: '15px', color: '#0f172a', background: '#fff',
                      outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '14px 16px 14px 46px',
                      border: '1.5px solid #e2e8f0', borderRadius: '12px',
                      fontSize: '15px', color: '#0f172a', background: '#fff',
                      outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
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
                  background: loading ? '#cbd5e1' : '#0f172a',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(15,23,42,0.15)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1e293b'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#0f172a'; }}
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
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Don't have a retail account?{' '}
                  <a onClick={() => navigate('/signup')} style={{ color: '#059669', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' }}>
                    Register here
                  </a>
                </p>
              </div>
            )}

          </div>

          <div style={{ position: 'absolute', bottom: '24px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>© 2026 BestCure Enterprise</p>
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