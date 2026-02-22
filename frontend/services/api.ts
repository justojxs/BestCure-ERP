// Use VITE_API_URL or fallback to relative route
const API_URL = import.meta.env.VITE_API_URL || '/api';

// helper to get auth headers from local storage
// dynamically adds the Authorization header if a token exists
const getHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bestcure_user'));
    return {
      'Content-Type': 'application/json',
      ...(user?.token && { Authorization: `Bearer ${user.token}` }),
    };
  } catch {
    // fallback if local storage is corrupted
    return { 'Content-Type': 'application/json' };
  }
};

// generic fetch wrapper — parses error messages from the API response
// standardizes error handling so components don't have to deal with raw fetch responses
const request = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`;
    try {
      // attempt to extract the specific error message sent by the backend
      const data = await res.json();
      errorMessage = data.message || data.errors?.map(e => e.message).join(', ') || errorMessage;
    } catch { /* use default message if json parsing fails */ }

    // throwing here allows useApi hook to catch it
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
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')) as Record<string, string>
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
  createOrder: (itemsOrData) => {
    const body = Array.isArray(itemsOrData) ? { items: itemsOrData } : itemsOrData;
    return request(`${API_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getOrders: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')) as Record<string, string>
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