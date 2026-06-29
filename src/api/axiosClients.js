import axios from 'axios';

// ─── Read Client (Read Replica DB) ───────────────────────────────────────────
// Used for: portfolio view, scheme listings, AMC listings, transaction history
export const readClient = axios.create({
  baseURL: '/api/read',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Write Client (Primary DB) ───────────────────────────────────────────────
// Used for: buy orders, registrations, profile updates, scheme CRUD
export const writeClient = axios.create({
  baseURL: '/api/write',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Attach JWT token to both clients ────────────────────────────────────────
const attachToken = (config) => {
  const token = localStorage.getItem('ff_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

readClient.interceptors.request.use(attachToken, (err) => Promise.reject(err));
writeClient.interceptors.request.use(attachToken, (err) => Promise.reject(err));

// ─── Response interceptor: handle 401 globally ───────────────────────────────
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

readClient.interceptors.response.use((res) => res, handleAuthError);
writeClient.interceptors.response.use((res) => res, handleAuthError);
