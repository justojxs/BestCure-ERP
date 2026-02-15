import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Plus, AlertTriangle, AlertCircle, Package, Edit2, Trash2, X, Save } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', batch: '', supplier: '', category: '',
    stock: 0, minStock: 10, price: 0, expiry: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        expiry: product.expiry ? new Date(product.expiry).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '', batch: '', supplier: '', category: 'Antibiotics',
        stock: 0, minStock: 10, price: 0, expiry: ''
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: '20px'
    }}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: '500px',
        borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f8fafc'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
            {product ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Medicine Name
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="e.g. Amoxicillin" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Batch Number
              <input required type="text" value={formData.batch} onChange={e => setFormData({ ...formData, batch: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="B-1001" />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Supplier
              <input required type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Pharma Inc" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Category
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
                <option>Antibiotics</option>
                <option>Vaccines</option>
                <option>Antiparasitic</option>
                <option>Anti-inflammatory</option>
                <option>Supplements</option>
                <option>Painkillers</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Stock
              <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Min Stock
              <input required type="number" min="0" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Price (₹)
              <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
            Expiry Date
            <input required type="date" value={formData.expiry} onChange={e => setFormData({ ...formData, expiry: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1',
              background: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: '#059669', color: '#fff', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Saving...' : <><Save size={18} /> Save Medicine</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (productData) => {
    if (editingItem) {
      // Update
      await api.updateProduct(editingItem._id, productData);
    } else {
      // Create
      await api.createProduct(productData);
    }
    await fetchProducts();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        await fetchProducts();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const getStatusInfo = (item) => {
    const isLowStock = item.stock < item.minStock;
    const isExpiring = new Date(item.expiry) < new Date();

    if (isExpiring) return { bg: 'rgba(239,68,68,0.06)', text: '#dc2626', border: 'rgba(239,68,68,0.15)', label: 'Expired' };
    if (isLowStock) return { bg: 'rgba(245,158,11,0.06)', text: '#d97706', border: 'rgba(245,158,11,0.15)', label: 'Low Stock' };
    return { bg: 'rgba(5,150,105,0.06)', text: '#059669', border: 'rgba(5,150,105,0.15)', label: 'In Stock' };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'low') return item.stock < item.minStock;
    if (filter === 'expiring') return new Date(item.expiry) < new Date();
    return true;
  });

  const filterButtons = [
    { key: 'all', label: 'All Items', icon: null, activeColor: '#0f172a', activeBg: '#0f172a' },
    { key: 'low', label: 'Low Stock', icon: AlertTriangle, activeColor: '#fff', activeBg: '#f59e0b' },
    { key: 'expiring', label: 'Expiring', icon: AlertCircle, activeColor: '#fff', activeBg: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingItem}
        onSave={handleSave}
      />

      {/* Page Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px', fontWeight: '700', color: '#0f172a',
            letterSpacing: '-0.5px',
          }}>Smart Inventory</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Manage medicines, batches, and suppliers
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
            color: '#ffffff', border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
            transition: 'all 0.25s ease',
          }}
        >
          <Plus size={18} />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text" placeholder="Search by name or batch number..."
            style={{
              width: '100%', padding: '10px 16px 10px 44px', background: '#f8fafc',
              border: '1px solid rgba(226,232,240,0.8)', borderRadius: '10px',
              fontSize: '14px', color: '#0f172a', outline: 'none', transition: 'all 0.2s ease',
            }}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {filterButtons.map(btn => {
            const active = filter === btn.key;
            return (
              <button key={btn.key} onClick={() => setFilter(btn.key)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                border: active ? 'none' : '1px solid rgba(226,232,240,0.8)',
                background: active ? btn.activeBg : '#f8fafc',
                color: active ? (btn.key === 'all' ? '#fff' : btn.activeColor) : '#64748b',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}>
                {btn.icon && <btn.icon size={14} />}
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(248, 250, 252, 0.5)', borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}>
                {['Medicine / Batch', 'Category', 'Stock', 'Expiry', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '16px 24px', fontSize: '11px', fontWeight: '700',
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px',
                    textAlign: h === 'Price' ? 'right' : h === 'Status' ? 'center' : h === 'Actions' ? 'right' : 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>Loading...</td></tr>
              ) : filteredItems.map((item) => {
                const isLow = item.stock < item.minStock;
                const status = getStatusInfo(item);
                const stockPercent = Math.min((item.stock / 2000) * 100, 100);

                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: "'SF Mono', monospace", marginTop: '4px' }}>
                        {item.batch}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#475569', padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: isLow ? '#d97706' : '#0f172a' }}>{item.stock}</span>
                        {isLow && <AlertTriangle size={14} style={{ color: '#f59e0b' }} />}
                      </div>
                      <div style={{ width: '80px', height: '4px', background: '#f1f5f9', borderRadius: '999px', marginTop: '6px' }}>
                        <div style={{ height: '100%', borderRadius: '999px', background: isLow ? '#f59e0b' : '#059669', width: `${stockPercent}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(item.expiry).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                        borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                        background: status.bg, color: status.text, border: `1px solid ${status.border}`
                      }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => openEditModal(item)} style={{
                          padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0',
                          background: '#fff', color: '#64748b', cursor: 'pointer'
                        }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} style={{
                          padding: '6px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)',
                          background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer'
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredItems.length === 0 && (
                <tr><td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Package size={40} style={{ color: '#e2e8f0', margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>No medicines found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}