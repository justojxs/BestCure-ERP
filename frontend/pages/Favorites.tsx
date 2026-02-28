import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Heart, ShoppingBag, Plus, Minus, Trash2, Package, Star, Search } from 'lucide-react';

// Favorites are stored locally for this user — a lightweight "wishlist" concept.
// In a production app you'd persist this server-side, but localStorage keeps the demo simple.

export default function Favorites() {
    const [products, setProducts] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('bestcure_favorites') || '[]'); }
        catch { return []; }
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [quickCart, setQuickCart] = useState<Record<string, number>>({});
    const [placing, setPlacing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => { loadProducts(); }, []);
    useEffect(() => { localStorage.setItem('bestcure_favorites', JSON.stringify(favorites)); }, [favorites]);

    const loadProducts = async () => {
        try { setProducts(await api.getProducts()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    };

    const updateQty = (id: string, delta: number) => {
        setQuickCart(prev => {
            const current = prev[id] || 0;
            const next = current + delta;
            if (next <= 0) { const { [id]: _, ...rest } = prev; return rest; }
            const product = products.find(p => p._id === id);
            if (product && next > product.stock) return prev;
            return { ...prev, [id]: next };
        });
    };

    const quickReorder = async () => {
        const items = Object.entries(quickCart).map(([id, qty]) => ({ product: id, quantity: qty }));
        if (items.length === 0) return;
        setPlacing(true);
        try {
            await api.createOrder(items);
            setQuickCart({});
            setMessage('Quick order placed successfully!');
            await loadProducts();
            setTimeout(() => setMessage(''), 4000);
        } catch (e: any) {
            setMessage(e.message || 'Failed to place order');
            setTimeout(() => setMessage(''), 4000);
        } finally { setPlacing(false); }
    };

    const favoriteProducts = products.filter(p => favorites.includes(p._id));
    const allProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const quickCartTotal = Object.entries(quickCart).reduce((sum, [id, qty]) => {
        const p = products.find(x => x._id === id);
        return sum + (p ? p.price * qty : 0);
    }, 0);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <span style={{ color: '#64748b', fontSize: '14px' }}>Loading favorites...</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Favorites & Quick Reorder
                </h1>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                    Save your frequently ordered medicines for one-tap reordering
                </p>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    padding: '12px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '500',
                    background: message.includes('success') ? 'rgba(5,150,105,0.08)' : 'rgba(239,68,68,0.08)',
                    color: message.includes('success') ? '#059669' : '#ef4444',
                    border: `1px solid ${message.includes('success') ? 'rgba(5,150,105,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <Star size={16} /> {message}
                </div>
            )}

            {/* Favorites Section */}
            {favoriteProducts.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Heart size={20} style={{ color: '#ef4444' }} fill="#ef4444" />
                            My Favorites ({favoriteProducts.length})
                        </h2>
                        {Object.keys(quickCart).length > 0 && (
                            <button onClick={quickReorder} disabled={placing} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '12px', border: 'none',
                                background: '#059669', color: '#fff',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
                            }}>
                                <ShoppingBag size={16} />
                                {placing ? 'Placing...' : `Quick Order — ₹${quickCartTotal.toFixed(2)}`}
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                        {favoriteProducts.map(item => {
                            const qty = quickCart[item._id] || 0;
                            return (
                                <div key={item._id} style={{
                                    background: '#fff', borderRadius: '16px',
                                    border: qty > 0 ? '1.5px solid rgba(5,150,105,0.3)' : '1px solid rgba(226,232,240,0.6)',
                                    overflow: 'hidden', transition: 'all 0.2s ease',
                                }}>
                                    <div style={{ display: 'flex', gap: '14px', padding: '16px' }}>
                                        {/* Product image */}
                                        <div style={{
                                            width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden',
                                            background: '#f1f5f9', flexShrink: 0,
                                        }}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={28} style={{ color: '#cbd5e1' }} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.name}</h3>
                                                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>{item.category} · {item.supplier}</p>
                                                </div>
                                                <button onClick={() => toggleFavorite(item._id)} style={{
                                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                                }}>
                                                    <Heart size={16} fill="#ef4444" style={{ color: '#ef4444' }} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                                                <span style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>₹{item.price}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {qty > 0 ? (
                                                        <>
                                                            <button onClick={() => updateQty(item._id, -1)} style={{
                                                                width: '28px', height: '28px', borderRadius: '8px',
                                                                background: '#f1f5f9', border: 'none', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                                                            }}><Minus size={14} /></button>
                                                            <span style={{ width: '28px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>{qty}</span>
                                                            <button onClick={() => updateQty(item._id, 1)} style={{
                                                                width: '28px', height: '28px', borderRadius: '8px',
                                                                background: '#f1f5f9', border: 'none', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                                                            }}><Plus size={14} /></button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => updateQty(item._id, 1)} disabled={item.stock <= 0} style={{
                                                            padding: '6px 14px', borderRadius: '8px', border: 'none',
                                                            background: item.stock <= 0 ? '#f1f5f9' : '#0f172a', color: item.stock <= 0 ? '#94a3b8' : '#fff',
                                                            fontSize: '12px', fontWeight: '600', cursor: item.stock <= 0 ? 'not-allowed' : 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                        }}>
                                                            <Plus size={12} /> Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All Products — browse and add to favorites */}
            <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
                    Browse All Products
                </h2>
                <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '16px' }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input
                        type="text" placeholder="Search medicines..."
                        style={{
                            width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px',
                            border: '1.5px solid rgba(226,232,240,0.8)', background: '#fff',
                            fontSize: '14px', color: '#0f172a', outline: 'none',
                        }}
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {allProducts.map(item => {
                        const isFav = favorites.includes(item._id);
                        return (
                            <div key={item._id} style={{
                                background: '#fff', borderRadius: '14px',
                                border: '1px solid rgba(226,232,240,0.6)',
                                padding: '14px', transition: 'all 0.2s ease',
                                cursor: 'pointer',
                            }}
                                onClick={() => toggleFavorite(item._id)}
                            >
                                <div style={{
                                    width: '100%', height: '90px', borderRadius: '10px', overflow: 'hidden',
                                    background: '#f8fafc', marginBottom: '10px',
                                }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={28} style={{ color: '#e2e8f0' }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.name}</p>
                                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>₹{item.price}</p>
                                    </div>
                                    <Heart size={16} fill={isFav ? '#ef4444' : 'none'} style={{ color: isFav ? '#ef4444' : '#cbd5e1', flexShrink: 0 }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
