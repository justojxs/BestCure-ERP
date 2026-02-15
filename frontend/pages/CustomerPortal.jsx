import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search, ShoppingCart, Check, Package, Clock, Shield, Plus, Minus,
  Trash2, ShoppingBag, CheckCircle, AlertCircle, X
} from 'lucide-react';



// ─── Main Component ───
export default function CustomerPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);


  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };



  const addToCart = (product) => {
    const existing = cart.find(c => c._id === product._id);
    if (existing) {
      if (existing.qty >= product.stock) return;
      setCart(cart.map(c => c._id === product._id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      if (product.stock <= 0) return;
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c._id !== id));

  const updateQty = (id, delta) => {
    setCart(cart.map(c => {
      if (c._id !== id) return c;
      const product = products.find(p => p._id === id);
      const newQty = c.qty + delta;
      if (newQty < 1 || newQty > (product?.stock || 9999)) return c;
      return { ...c, qty: newQty };
    }).filter(c => c.qty > 0));
  };

  const cartTotal = cart.reduce((acc, c) => acc + c.price * c.qty, 0);
  const cartTax = cartTotal * 0.18;
  const cartGrandTotal = cartTotal + cartTax;
  const cartItemCount = cart.reduce((acc, c) => acc + c.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    setErrorMsg('');
    try {
      const items = cart.map(c => ({ product: c._id, quantity: c.qty }));
      await api.createOrder(items);
      setSuccessMsg('Order placed successfully! You can track it in Order History.');
      setCart([]);
      setShowCart(false);
      await loadProducts(); // refresh stock
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      setErrorMsg(error.message);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setPlacing(false);
    }
  };

  const getStockColor = (stock) => {
    if (stock <= 0) return '#ef4444';
    if (stock < 50) return '#f59e0b';
    return '#059669';
  };

  const filteredItems = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Loading State ───
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', gap: '12px',
    }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid rgba(5,150,105,0.15)',
        borderTopColor: '#059669',
        borderRadius: '50%',
        animation: 'spin-slow 0.8s linear infinite',
      }} />
      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading catalog...</span>
    </div>
  );



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Success / Error messages */}
      {successMsg && (
        <div style={{
          padding: '14px 20px', borderRadius: '12px',
          background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)',
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
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', fontSize: '14px', fontWeight: '500',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #0d9488 40%, #0891b2 100%)',
        borderRadius: '20px', padding: '36px 32px',
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-30%', right: '-5%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', background: 'rgba(255,255,255,0.15)',
            borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            marginBottom: '14px', backdropFilter: 'blur(8px)',
          }}>
            <Shield size={14} /> Verified Wholesale Partner
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            BestCure Wholesale Portal
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', maxWidth: '500px' }}>
            Browse medicines, place bulk orders, and track your order history.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} style={{ opacity: 0.7 }} />
              <span style={{ fontSize: '13px', opacity: 0.8 }}>{products.length} Products</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} style={{ opacity: 0.7 }} />
              <span style={{ fontSize: '13px', opacity: 0.8 }}>Same-day Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cart button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowCart(!showCart)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '12px', border: 'none',
          background: cart.length > 0
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : '#f1f5f9',
          color: cart.length > 0 ? '#ffffff' : '#64748b',
          fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          boxShadow: cart.length > 0 ? '0 4px 16px rgba(15,23,42,0.2)' : 'none',
          transition: 'all 0.25s ease',
          position: 'relative',
        }}>
          <ShoppingCart size={17} />
          Cart
          {cartItemCount > 0 && (
            <span style={{
              background: '#059669', color: '#fff', fontSize: '11px', fontWeight: '700',
              width: '22px', height: '22px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'absolute', top: '-8px', right: '-8px',
              boxShadow: '0 2px 8px rgba(5,150,105,0.4)',
            }}>
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* ═══ CATALOG ═══ */}
      {
        <>
          {/* Cart Panel */}
          {showCart && (
            <div style={{
              background: '#ffffff', borderRadius: '16px',
              border: '1px solid rgba(226,232,240,0.6)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingCart size={18} /> Your Cart
                  <span style={{
                    fontSize: '12px', fontWeight: '500', color: 'rgba(148,163,184,0.7)',
                    padding: '2px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px',
                  }}>
                    {cart.length} items
                  </span>
                </h3>
                <button onClick={() => setShowCart(false)} style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: 'rgba(226,232,240,0.7)', cursor: 'pointer',
                  width: '32px', height: '32px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={16} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <ShoppingCart size={40} style={{ color: '#e2e8f0', margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>Your cart is empty</p>
                </div>
              ) : (
                <div>
                  <div style={{ padding: '16px 24px' }}>
                    {cart.map(item => (
                      <div key={item._id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 0', borderBottom: '1px solid #f8fafc',
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{item.name}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>₹{item.price.toFixed(2)} each</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => updateQty(item._id, -1)} style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: '#f1f5f9', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                          }}>
                            <Minus size={14} />
                          </button>
                          <span style={{ width: '32px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                            {item.qty}
                          </span>
                          <button onClick={() => updateQty(item._id, 1)} style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: '#f1f5f9', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                          }}>
                            <Plus size={14} />
                          </button>
                          <span style={{ width: '70px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                            ₹{(item.price * item.qty).toFixed(2)}
                          </span>
                          <button onClick={() => removeFromCart(item._id)} style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#ef4444',
                          }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart totals */}
                  <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>GST (18%)</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>₹{cartTax.toFixed(2)}</span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      paddingTop: '12px', borderTop: '1px solid #e2e8f0',
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Total</span>
                      <span style={{
                        fontSize: '20px', fontWeight: '700',
                        background: 'linear-gradient(135deg, #059669, #0d9488)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>₹{cartGrandTotal.toFixed(2)}</span>
                    </div>
                    <button onClick={placeOrder} disabled={placing} style={{
                      width: '100%', marginTop: '16px', padding: '14px',
                      background: placing ? 'rgba(5,150,105,0.5)' : 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                      color: '#ffffff', border: 'none', borderRadius: '12px',
                      fontSize: '14px', fontWeight: '600', cursor: placing ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 16px rgba(5,150,105,0.25)',
                      transition: 'all 0.25s ease',
                    }}>
                      {placing ? (
                        <>
                          <div style={{
                            width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#fff', borderRadius: '50%',
                            animation: 'spin-slow 0.8s linear infinite',
                          }} />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          Place Order — ₹{cartGrandTotal.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '480px' }}>
            <Search style={{
              position: 'absolute', left: '16px', top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8',
            }} size={18} />
            <input
              type="text"
              placeholder="Search medicines by name or category..."
              style={{
                width: '100%', padding: '12px 20px 12px 48px',
                borderRadius: '12px', border: '1px solid rgba(226,232,240,0.8)',
                background: '#ffffff', color: '#0f172a', fontSize: '14px',
                outline: 'none', transition: 'all 0.2s ease',
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(5,150,105,0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(226,232,240,0.8)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Product Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {filteredItems.map((item) => {
              const inCart = cart.find(c => c._id === item._id);
              const outOfStock = item.stock <= 0;
              return (
                <div key={item._id} style={{
                  background: '#ffffff', borderRadius: '16px',
                  border: inCart ? '1.5px solid rgba(5,150,105,0.3)' : '1px solid rgba(226,232,240,0.6)',
                  overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: outOfStock ? 0.6 : 1,
                }}
                  onMouseEnter={(e) => {
                    if (!outOfStock) {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    height: '3px',
                    background: inCart
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #e2e8f0, #f1f5f9)',
                  }} />

                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px',
                          background: 'rgba(5,150,105,0.06)', color: '#059669',
                          fontSize: '11px', fontWeight: '600', borderRadius: '6px', marginBottom: '8px',
                        }}>{item.category}</span>
                        <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{item.name}</h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.supplier}</p>
                      </div>
                      <span style={{
                        fontWeight: '700', fontSize: '18px',
                        background: 'linear-gradient(135deg, #059669, #0d9488)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>₹{item.price}</span>
                    </div>

                    {/* Stock + Expiry info */}
                    <div style={{
                      display: 'flex', gap: '12px', marginBottom: '16px',
                      padding: '12px', background: '#f8fafc', borderRadius: '10px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Stock</div>
                        <div style={{
                          fontSize: '14px', fontWeight: '700',
                          color: getStockColor(item.stock),
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: getStockColor(item.stock),
                          }} />
                          {item.stock > 0 ? `${item.stock} units` : 'Out of Stock'}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Batch</div>
                        <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500', fontFamily: "'SF Mono', monospace" }}>
                          {item.batch}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart button */}
                    {inCart ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', background: 'rgba(5,150,105,0.06)',
                        borderRadius: '12px', border: '1px solid rgba(5,150,105,0.15)',
                      }}>
                        <button onClick={() => updateQty(item._id, -1)} style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: '#ffffff', border: '1px solid rgba(226,232,240,0.8)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#475569', transition: 'all 0.15s ease',
                        }}>
                          <Minus size={15} />
                        </button>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#059669' }}>
                          {inCart.qty} in cart
                        </span>
                        <button onClick={() => updateQty(item._id, 1)} disabled={inCart.qty >= item.stock} style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: inCart.qty >= item.stock ? '#f1f5f9' : '#ffffff',
                          border: '1px solid rgba(226,232,240,0.8)',
                          cursor: inCart.qty >= item.stock ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: inCart.qty >= item.stock ? '#cbd5e1' : '#475569',
                        }}>
                          <Plus size={15} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} disabled={outOfStock} style={{
                        width: '100%', padding: '11px', borderRadius: '12px',
                        fontSize: '13px', fontWeight: '600', border: 'none',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: outOfStock ? '#f1f5f9' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: outOfStock ? '#94a3b8' : '#ffffff',
                        boxShadow: outOfStock ? 'none' : '0 2px 8px rgba(15,23,42,0.2)',
                        transition: 'all 0.25s ease',
                      }}
                        onMouseEnter={(e) => {
                          if (!outOfStock) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = outOfStock ? 'none' : '0 2px 8px rgba(15,23,42,0.2)';
                        }}
                      >
                        {outOfStock ? (
                          <><AlertCircle size={16} /> Out of Stock</>
                        ) : (
                          <><ShoppingBag size={16} /> Add to Cart</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>}
    </div>
  );
}