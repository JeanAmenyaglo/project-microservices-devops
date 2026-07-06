import axios from 'axios';

// In Docker Compose, the Vite dev server proxies these to the right service
// In production (K8s), an Ingress routes by path
const userApi = axios.create({ baseURL: '/api/users' });
const productApi = axios.create({ baseURL: '/api/products' });

// ── User Service ──────────────────────────────
export const getUsers = () => userApi.get('/');
export const getUserById = (id) => userApi.get(`/${id}`);
export const createUser = (data) => userApi.post('/', data);
export const updateUser = (id, data) => userApi.put(`/${id}`, data);
export const deleteUser = (id) => userApi.delete(`/${id}`);

// ── Product Service ───────────────────────────
export const getProducts = () => productApi.get('/');
export const getProductById = (id) => productApi.get(`/${id}`);
export const getProductsByOwner = (owner_id) => productApi.get(`/owner/${owner_id}`);
export const createProduct = (data) => productApi.post('/', data);
export const updateProduct = (id, data) => productApi.put(`/${id}`, data);
export const deleteProduct = (id) => productApi.delete(`/${id}`);

// ── Health Checks ─────────────────────────────
export const checkUserServiceHealth = () =>
  axios.get('http://localhost:3001/health').catch(() => ({ data: { status: 'unreachable' } }));
export const checkProductServiceHealth = () =>
  axios.get('http://localhost:3002/health').catch(() => ({ data: { status: 'unreachable' } }));
