const API_URL = '/api';

/**
 * Get authorization headers from stored user session.
 * @returns {Record<string, string>} Headers object with Content-Type and optional Authorization
 */
const getHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bestcure_user'));
    return {
      'Content-Type': 'application/json',
      ...(user?.token && { Authorization: `Bearer ${user.token}` }),
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
};

/**
 * Generic fetch wrapper with error handling.
 * Parses error messages from API responses.
 */
const request = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      errorMessage = data.message || data.errors?.map(e => e.message).join(', ') || errorMessage;
    } catch { /* use default message */ }
    throw new Error(errorMessage);
  }

  return res.json();
};

/**
 * API client — all backend communication goes through this module.
 * Each method returns a Promise that resolves to the parsed JSON response.
 */
export const api = {
  // ── Auth ──
  login: (email, password) =>
    request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () =>
    request(`${API_URL}/auth/me`),

  // ── Products ──
  getProducts: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ''))
    ).toString();
    return request(`${API_URL}/products${query ? `?${query}` : ''}`);
  },

  getProductById: (id) =>
    request(`${API_URL}/products/${id}`),

  createProduct: (data) =>
    request(`${API_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    request(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    request(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    }),

  // ── Analytics ──
  getDashboardStats: () =>
    request(`${API_URL}/analytics/dashboard`),

  // ── Orders ──
  createOrder: (items) =>
    request(`${API_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  getOrders: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ''))
    ).toString();
    return request(`${API_URL}/orders${query ? `?${query}` : ''}`);
  },

  getOrderById: (id) =>
    request(`${API_URL}/orders/${id}`),

  updateOrderStatus: (id, status, statusNote = '') =>
    request(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, statusNote }),
    }),

  // ── Health ──
  health: () => request(`${API_URL}/health`),
};