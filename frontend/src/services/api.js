import axios from 'axios';

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:3002';

const userApi = axios.create({ baseURL: `${USER_SERVICE_URL}/api/users` });
const productApi = axios.create({ baseURL: `${PRODUCT_SERVICE_URL}/api/products` });

export const getUsers = () => userApi.get('/');
export const getUserById = (id) => userApi.get(`/${id}`);
export const createUser = (data) => userApi.post('/', data);
export const updateUser = (id, data) => userApi.put(`/${id}`, data);
export const deleteUser = (id) => userApi.delete(`/${id}`);

export const getProducts = () => productApi.get('/');
export const getProductById = (id) => productApi.get(`/${id}`);
export const getProductsByOwner = (owner_id) => productApi.get(`/owner/${owner_id}`);
export const createProduct = (data) => productApi.post('/', data);
export const updateProduct = (id, data) => productApi.put(`/${id}`, data);
export const deleteProduct = (id) => productApi.delete(`/${id}`);

export const checkUserServiceHealth = () =>
  axios.get(`${USER_SERVICE_URL}/health`).catch(() => ({ data: { status: 'unreachable' } }));
export const checkProductServiceHealth = () =>
  axios.get(`${PRODUCT_SERVICE_URL}/health`).catch(() => ({ data: { status: 'unreachable' } }));