import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingCart, Plus, Trash2, Printer, User, Package, Receipt, Minus } from 'lucide-react';

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
  }, []);

  const addToCart = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p._id === selectedProduct);

    if (product) {
      const existingItem = cart.find(item => item._id === product._id);
      if (existingItem) {
        setCart(cart.map(item =>
          item._id === product._id ? { ...item, qty: item.qty + quantity } : item
        ));
      } else {
        setCart([...cart, { ...product, qty: quantity }]);
      }
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.10;
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();
  const invoiceNum = `INV-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ height: '100%', display: 'flex', gap: '24px' }}>

      {/* Left: Product Selection */}
      <div className="no-print" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

        {/* Header */}
        <div>
          <h1 style={{
            fontSize: '24px', fontWeight: '700', color: '#0f172a',
            letterSpacing: '-0.5px',
          }}>Billing & Invoicing</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Create invoices and manage billing
          </p>
        </div>

        {/* New Invoice Form */}
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(226,232,240,0.6)',
        }}>
          <h2 style={{
            fontSize: '16px', fontWeight: '600', color: '#0f172a',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              background: 'rgba(5,150,105,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Receipt size={16} style={{ color: '#059669' }} />
            </div>
            New Invoice
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: '#64748b', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Select Medicine</label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid rgba(226,232,240,0.8)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(5,150,105,0.4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(226,232,240,0.8)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select a product...</option>
                {products.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name} - ₹{item.price} (Stock: {item.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: '#64748b', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Quantity</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  min="1"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: '1px solid rgba(226,232,240,0.8)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(5,150,105,0.4)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(226,232,240,0.8)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={addToCart}
                  style={{
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #059669, #0d9488)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(5,150,105,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(5,150,105,0.25)';
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Products */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(226,232,240,0.6)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Package size={16} style={{ color: '#94a3b8' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Quick Select</h3>
          </div>
          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {products.slice(0, 4).map(item => (
              <div
                key={item._id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedProduct === item._id
                    ? '1.5px solid rgba(5,150,105,0.4)'
                    : '1px solid rgba(226,232,240,0.8)',
                  background: selectedProduct === item._id ? 'rgba(5,150,105,0.03)' : '#fafbfd',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
                onClick={() => { setSelectedProduct(item._id); setQuantity(1); }}
                onMouseEnter={(e) => {
                  if (selectedProduct !== item._id) {
                    e.currentTarget.style.borderColor = 'rgba(5,150,105,0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProduct !== item._id) {
                    e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{item.name}</p>
                  <p style={{
                    fontSize: '11px', color: '#94a3b8', marginTop: '4px',
                    fontFamily: "'SF Mono', monospace",
                  }}>{item.batch}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#059669' }}>₹{item.price}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Invoice Panel */}
      <div style={{
        width: '380px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid rgba(226,232,240,0.6)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Invoice header */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{
              fontSize: '18px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShoppingCart size={18} />
              </div>
              Current Bill
            </h2>
            <span style={{
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              color: 'rgba(226,232,240,0.7)',
            }}>{invoiceNum}</span>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <User size={16} style={{ color: 'rgba(148,163,184,0.5)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Customer name or clinic..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  width: '100%',
                }}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Cart items */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 20px',
        }} className="no-scrollbar">
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 20px',
            }}>
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <ShoppingCart size={24} style={{ color: '#cbd5e1' }} />
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>No items added</p>
              <p style={{ color: '#cbd5e1', fontSize: '12px', marginTop: '4px' }}>Select products to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item) => (
                <div key={item._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px',
                  background: '#fafbfd',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.15s ease',
                }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: '#0f172a' }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {item.qty} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                      ₹{(item.qty * item.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="no-print"
                      style={{
                        width: '30px', height: '30px',
                        borderRadius: '8px',
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        color: '#ef4444',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Actions */}
        <div style={{
          padding: '20px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Tax (10%)</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #e2e8f0',
            }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Total</span>
              <span style={{
                fontSize: '20px', fontWeight: '700',
                background: 'linear-gradient(135deg, #059669, #0d9488)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePrint}
            disabled={cart.length === 0}
            className="no-print"
            style={{
              width: '100%',
              padding: '13px',
              background: cart.length === 0
                ? '#e2e8f0'
                : 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
              color: cart.length === 0 ? '#94a3b8' : '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: cart.length === 0 ? 'none' : '0 4px 12px rgba(5,150,105,0.25)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (cart.length > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = cart.length === 0 ? 'none' : '0 4px 12px rgba(5,150,105,0.25)';
            }}
          >
            <Printer size={18} />
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
}