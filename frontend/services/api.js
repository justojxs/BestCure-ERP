const API_URL = '/api';

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

// generic fetch wrapper — parses error messages from the API response
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

export const api = {
  // auth
  login: (email, password) =>
    request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () =>
    request(`${API_URL}/auth/me`),

  // products
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

  // analytics
  getDashboardStats: () =>
    request(`${API_URL}/analytics/dashboard`),

  // orders
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

  health: () => request(`${API_URL}/health`),
};