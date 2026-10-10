// ============================================
// SHOPKART API CLIENT
// ============================================

// The backend serves both the pages and the API, so a relative path works
// on localhost and on the live site.
const API_BASE = '/api';

const api = {
  // Token & User helpers
  getToken() {
    return localStorage.getItem('shopkart_token');
  },
  setToken(token) {
    localStorage.setItem('shopkart_token', token);
  },
  removeToken() {
    localStorage.removeItem('shopkart_token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('shopkart_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  setCurrentUser(user) {
    localStorage.setItem('shopkart_user', JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem('shopkart_user');
    this.removeToken();
  },

  // HTTP GET
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, window.location.origin);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url.searchParams.append(k, params[k]);
      }
    });

    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { headers });
    return await res.json();
  },

  // HTTP POST
  async post(endpoint, body = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return await res.json();
  }
};