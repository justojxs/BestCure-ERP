import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShoppingCart, Plus, Trash2, Printer, Search, Package,
  Filter, ChevronRight, User, FileText, Minus, RefreshCw
} from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [invoiceNum, setInvoiceNum] = useState(''); // Empty initially
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    api.getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const addToCart = (product) => {
    setOrderSuccess(false); // Reset success state if modifying cart
    setInvoiceNum('');
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      if (existing.qty >= product.stock) return;
      setCart(cart.map(item =>
        item._id === product._id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const decreaseQty = (id) => {
    setOrderSuccess(false);
    setInvoiceNum('');
    const existing = cart.find(item => item._id === id);
    if (existing.qty > 1) {
      setCart(cart.map(item =>
        item._id === id ? { ...item, qty: item.qty - 1 } : item
      ));
    } else {
      removeFromCart(id);
    }
  };

  const removeFromCart = (id) => {
    setOrderSuccess(false);
    setInvoiceNum('');
    setCart(cart.filter(item => item._id !== id));
  };

  const resetOrder = () => {
    setCart([]);
    setCustomerName('');
    setInvoiceNum('');
    setOrderSuccess(false);
    setSearchTerm('');
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.18;
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProcessAndPrint = async () => {
    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (cart.length === 0) return;

    // If order already placed (invoice number exists), just print
    if (invoiceNum) {
      window.print();
      return;
    }

    setIsProcessing(true);
    try {
      const orderItems = cart.map(item => ({
        product: item._id,
        quantity: item.qty
      }));

      const response = await api.createOrder({
        items: orderItems,
        customerName: customerName
      });

      setInvoiceNum(response.orderNumber);
      setOrderSuccess(true);

      // Wait for render cycle to update DOM with new invoice number before printing
      setTimeout(() => {
        window.print();
        setIsProcessing(false);
      }, 500);

    } catch (error) {
      console.error("Failed to create order", error);
      alert("Failed to process order: " + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="animate-fadeIn no-print-container billing-layout">

        {/* ── LEFT: Product Catalog ── */}
        <div className="billing-catalog">

          {/* Header & Search */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className="page-title">New Order</h1>
                <p className="page-subtitle">Select medicines to create an invoice</p>
              </div>
              {orderSuccess && (
                <button onClick={resetOrder} className="btn btn-secondary" style={{ display: 'flex', gap: '8px' }}>
                  <RefreshCw size={16} /> New Order
                </button>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search className="text-slate-400" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
                <input
                  type="text"
                  placeholder="Search medicines by name or batch..."
                  className="form-input"
                  style={{ paddingLeft: '48px', height: '52px', fontSize: '16px', shadow: 'var(--shadow-sm)' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', paddingBottom: '20px' }} className="no-scrollbar">
            {loading ? (
              <div className="loading-container" style={{ height: '300px' }}>
                <div className="spinner"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Package size={48} /></div>
                <h3>No medicines found</h3>
                <p>Try searching for a different name.</p>
              </div>
            ) : (
              <div className="grid-3">
                {filteredProducts.map(product => {
                  const inCart = cart.find(c => c._id === product._id);
                  const stockLow = product.stock < 10;

                  return (
                    <div key={product._id} className="card product-card" style={{
                      padding: '20px',
                      border: inCart ? '1px solid var(--color-primary)' : '1px solid var(--surface-border)',
                      background: inCart ? 'var(--color-primary-50)' : 'var(--surface-card)',
                      transition: 'all 0.2s ease',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{product.name}</h3>
                          <span className={`badge ${stockLow ? 'badge-danger' : 'badge-success'}`}>
                            {product.stock} left
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-slate-500)', marginBottom: '12px' }}>
                          Batch: {product.batch}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-slate-800)' }}>
                          ₹{product.price}
                        </span>

                        {inCart ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', borderRadius: '8px', padding: '2px', border: '1px solid var(--surface-border)' }}>
                            <button onClick={() => decreaseQty(product._id)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontWeight: '600', fontSize: '14px', width: '20px', textAlign: 'center' }}>{inCart.qty}</span>
                            <button onClick={() => addToCart(product)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }} disabled={inCart.qty >= product.stock}>
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="btn btn-primary btn-sm"
                            disabled={product.stock === 0}
                          >
                            Add <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Invoice Panel ── */}
        <div className="card billing-invoice-panel">

          {/* Invoice Header */}
          <div style={{ padding: '24px', background: orderSuccess ? 'var(--color-success)' : 'var(--color-slate-900)', color: 'white', transition: 'background 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Invoice</p>
                  <p style={{ fontWeight: '700', fontSize: '16px' }}>{invoiceNum || 'DRAFT'}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>Date</p>
                <p style={{ fontWeight: '600' }}>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="Customer Name (Required)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="form-input"
                disabled={orderSuccess}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  paddingLeft: '36px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <ShoppingCart size={40} className="empty-state-icon" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--color-slate-400)' }}>Cart is empty</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface-bg)', borderRadius: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>
                        {item.qty} x ₹{item.price}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', fontSize: '14px' }}>₹{(item.qty * item.price).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        disabled={orderSuccess}
                        style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '4px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', opacity: orderSuccess ? 0.5 : 1 }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Footer */}
          <div style={{ padding: '24px', background: 'var(--surface-bg)', borderTop: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-slate-500)' }}>Subtotal</span>
              <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-slate-500)' }}>Tax (18%)</span>
              <span style={{ fontWeight: '600' }}>₹{tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>Total</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-slate-900)' }}>₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleProcessAndPrint}
              disabled={cart.length === 0 || isProcessing || (!invoiceNum && !customerName.trim())}
              className={`btn ${orderSuccess ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px' }}
            >
              {isProcessing ? 'Processing Order...' : invoiceNum ? 'Reprint Invoice' : 'Generate & Print Invoice'}
              {!isProcessing && <Printer size={20} />}
            </button>
          </div>
        </div>

      </div>

      {/* ── PRINT-ONLY INVOICE TEMPLATE ── */}
      <div className="printable-invoice" style={{ display: 'none' }}>
        <InvoiceTemplate order={{
          orderNumber: invoiceNum || 'DRAFT',
          customerName: customerName,
          items: cart,
          subtotal,
          tax,
          total,
          createdAt: new Date().toISOString()
        }} />
      </div>
    </>
  );
}