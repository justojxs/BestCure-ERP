import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search, ShoppingCart, Check, Package, Clock, Shield, Plus, Minus,
  Trash2, ShoppingBag, CheckCircle, AlertCircle, X, Heart
} from 'lucide-react';

export default function CustomerPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bestcure_favorites') || '[]'); }
    catch { return []; }
  });

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { localStorage.setItem('bestcure_favorites', JSON.stringify(favorites)); }, [favorites]);

  const loadProducts = async () => {
    try { setProducts(await api.getProducts()); }
    catch (e) { console.error("Failed to fetch products", e); }
    finally { setLoading(false); }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const addToCart = (product: any) => {
    const existing = cart.find(c => c._id === product._id);
    if (existing) {
      if (existing.qty >= product.stock) return;
      setCart(cart.map(c => c._id === product._id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      if (product.stock <= 0) return;
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) => setCart(cart.filter(c => c._id !== id));

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c._id !== id) return c;
      const product = products.find(p => p._id === id);
      const newQty = c.qty + delta;
      if (newQty > (product?.stock || 9999)) return c;
      return { ...c, qty: newQty };
    }).filter(c => c.qty > 0));
  };

  const cartTotal = cart.reduce((acc, c) => acc + c.price * c.qty, 0);
  const cartTax = cartTotal * 0.18;
  const cartGrandTotal = cartTotal + cartTax;
  const cartItemCount = cart.reduce((acc, c) => acc + c.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true); setErrorMsg('');
    try {
      const items = cart.map(c => ({ product: c._id, quantity: c.qty }));
      await api.createOrder(items);
      setSuccessMsg('Order placed... Its status will be updated soon. Thanks for choosing BestCure.');
      setCart([]); setShowCart(false);
      await loadProducts();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error: any) {
      setErrorMsg(error.message);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally { setPlacing(false); }
  };

  const getStockColor = (stock: number) => {
    if (stock <= 0) return '#ef4444';
    if (stock < 50) return '#f59e0b';
    return '#059669';
  };

  const filteredItems = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading catalog...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          padding: '14px 20px', borderRadius: '12px',
          background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.15)',
          color: '#059669', fontSize: '14px', fontWeight: '500',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{
          padding: '14px 20px', borderRadius: '12px',
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
          color: '#ef4444', fontSize: '14px', fontWeight: '500',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #0d9488 40%, #0891b2 100%)',
        borderRadius: '20px', padding: '32px 28px',
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40%', right: '-8%',
          width: '260px', height: '260px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', background: 'rgba(255,255,255,0.12)',
            borderRadius: '20px', fontSize: '11px', fontWeight: '600', marginBottom: '12px',
          }}>
            <Shield size={12} /> Verified Wholesale Partner
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            BestCure Wholesale Portal
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', maxWidth: '440px' }}>
            Browse medicines, place bulk orders, and track your order history.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={14} style={{ opacity: 0.7 }} />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{products.length} Products</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} style={{ opacity: 0.7 }} />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Same-day Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Floating Cart Summary Banner */}
      {cart.length > 0 && !showCart && (
        <div style={{
          background: '#0f172a', color: 'white', padding: '16px 24px', borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 12px rgba(15,23,42,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0, paddingRight: '16px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ShoppingBag size={24} style={{ color: '#34d399' }} />
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px',
                background: '#059669', color: '#fff', fontSize: '11px', fontWeight: '700',
                padding: '2px 6px', borderRadius: '12px'
              }}>{cartItemCount}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cart.map(c => `${c.qty}x ${c.name}`).join(', ')}
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Real-time Total Value: <span style={{ color: '#fff', fontWeight: 700 }}>₹{cartGrandTotal.toFixed(2)}</span></p>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} style={{
            background: '#059669', color: 'white', border: 'none', padding: '10px 20px',
            borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(5,150,105,0.3)'
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
          >
            Proceed to Order <span style={{ fontSize: '16px' }}>→</span>
          </button>
        </div>
      )}

      {/* Redundant cart toggle removed per user request */}

      {/* Order Panel */}
      {showCart && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.5)', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #f1f5f9', background: '#0f172a', color: 'white',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={17} /> Proceed to Order
              <span style={{
                fontSize: '11px', fontWeight: '500', color: 'rgba(148,163,184,0.7)',
                padding: '2px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px',
              }}>
                {cart.length} items
              </span>
            </h3>
            <button onClick={() => setShowCart(false)} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(226,232,240,0.7)',
              cursor: 'pointer', width: '30px', height: '30px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} />
            </button>
          </div>
          {cart.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <ShoppingBag size={36} style={{ color: '#e2e8f0', margin: '0 auto 10px', display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your cart is empty</p>
            </div>
          ) : (
            <div>
              <div style={{ padding: '14px 20px' }}>
                {cart.map(item => (
                  <div key={item._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid #f8fafc',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden',
                        background: '#f1f5f9', flexShrink: 0,
                      }}>
                        {item.image ? (
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} style={{ color: '#cbd5e1' }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '13px', color: '#0f172a' }}>{item.name}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>₹{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => updateQty(item._id, -1)} style={{
                        width: '28px', height: '28px', borderRadius: '6px', background: '#f1f5f9',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                      }}><Minus size={12} /></button>
                      <span style={{ width: '28px', textAlign: 'center', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item._id, 1)} style={{
                        width: '28px', height: '28px', borderRadius: '6px', background: '#f1f5f9',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                      }}><Plus size={12} /></button>
                      <span style={{ width: '60px', textAlign: 'right', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                        ₹{(item.price * item.qty).toFixed(2)}
                      </span>
                      <button onClick={() => removeFromCart(item._id)} style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444',
                      }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Totals & Payments */}
              <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '32px' }}>

                {/* Payment Option */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>Payment Option</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1.5px solid #059669', background: 'rgba(5,150,105,0.05)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="payment" defaultChecked style={{ accentColor: '#059669', width: '16px', height: '16px' }} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Pay with Cash / UPI at the time of delivery</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9', borderRadius: '8px', cursor: 'not-allowed', opacity: 0.6 }}>
                      <input type="radio" name="payment" disabled />
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Online Payment (Coming soon...)</span>
                    </label>
                  </div>
                </div>

                {/* Subtotal Section */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>GST (18%)</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>₹{cartTax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #cbd5e1', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Total Amount</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>₹{cartGrandTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={placeOrder} disabled={placing} style={{
                    width: '100%', padding: '14px',
                    background: placing ? 'rgba(5,150,105,0.5)' : '#059669',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontSize: '14px', fontWeight: '700', cursor: placing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: placing ? 'none' : '0 4px 12px rgba(5,150,105,0.2)', transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={(e) => { if (!placing) e.currentTarget.style.background = '#047857' }}
                    onMouseLeave={(e) => { if (!placing) e.currentTarget.style.background = '#059669' }}
                  >
                    {placing ? (
                      <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
                    ) : (
                      <><CheckCircle size={18} /> Confirm Order</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '440px' }}>
        <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={17} />
        <input
          type="text" placeholder="Search medicines by name or category..."
          style={{
            width: '100%', padding: '11px 18px 11px 44px', borderRadius: '12px',
            border: '1.5px solid rgba(226,232,240,0.7)', background: '#fff',
            color: '#0f172a', fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
          }}
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(5,150,105,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.06)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(226,232,240,0.7)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Data Table View (ERP Style) */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid rgba(226,232,240,0.8)' }}>
                {['Item', 'Details', 'Category', 'Stock Available', 'Unit Price', 'Order Qty', 'Total'].map(h => (
                  <th key={h} style={{
                    padding: '16px 20px', fontSize: '11px', fontWeight: '700',
                    color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const inCart = cart.find(c => c._id === item._id);
                const outOfStock = item.stock <= 0;
                const qty = inCart ? inCart.qty : 0;
                const lineTotal = qty * item.price;
                const isFav = favorites.includes(item._id);

                return (
                  <tr key={item._id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: inCart ? 'rgba(5,150,105,0.03)' : '#fff',
                    opacity: outOfStock ? 0.6 : 1,
                    transition: 'background 0.2s ease'
                  }}
                    onMouseEnter={(e) => { if (!inCart && !outOfStock) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { if (!inCart && !outOfStock) e.currentTarget.style.background = '#fff'; }}
                  >
                    <td style={{ padding: '16px 20px', width: '80px' }}>
                      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                          {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="#94a3b8" /></div>}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item._id); }} style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        }}>
                          <Heart size={10} fill={isFav ? '#ef4444' : 'none'} style={{ color: isFav ? '#ef4444' : '#94a3b8' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                        Batch: {item.batch} <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span> Mfr: {item.supplier}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#059669', padding: '4px 8px', background: 'rgba(5,150,105,0.1)', borderRadius: '6px' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: outOfStock ? '#ef4444' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStockColor(item.stock) }} />
                        {item.stock} Units
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 20px', width: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                        <button onClick={() => updateQty(item._id, -1)} disabled={qty <= 0} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: qty <= 0 ? 'not-allowed' : 'pointer', color: '#475569' }}>
                          <Minus size={14} />
                        </button>
                        <input
                          type="text"
                          value={qty || ''}
                          placeholder="0"
                          readOnly
                          style={{ width: '40px', textAlign: 'center', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '700', color: '#0f172a', outline: 'none' }}
                        />
                        <button onClick={() => addToCart(item)} disabled={outOfStock || qty >= item.stock} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: (outOfStock || qty >= item.stock) ? 'not-allowed' : 'pointer', color: '#475569' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: lineTotal > 0 ? '#059669' : '#94a3b8' }}>
                      ₹{lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}