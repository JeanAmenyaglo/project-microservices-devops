const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/models/db', () => ({
  pool: { query: jest.fn() },
  connectDB: jest.fn(),
}));

jest.mock('../src/middleware/userClient', () => ({
  validateUser: (req, res, next) => {
    req.user = { id: 1, name: 'Jean', email: 'jean@test.com' };
    next();
  },
}));

const { pool } = require('../src/models/db');

beforeEach(() => jest.clearAllMocks());

describe('GET /health', () => {
  it('returns healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('GET /ready', () => {
  it('returns ready', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});

describe('GET /api/products', () => {
  it('returns product list', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Laptop', price: 999.99 }] });
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
  });
});

describe('POST /api/products', () => {
  it('creates a product', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Laptop', price: 999.99, owner_id: 1 }] });
    const res = await request(app).post('/api/products').send({ name: 'Laptop', price: 999.99, owner_id: 1 });
    expect(res.status).toBe(201);
  });

  it('rejects missing name', async () => {
    const res = await request(app).post('/api/products').send({ price: 999.99, owner_id: 1 });
    expect(res.status).toBe(400);
  });

  it('rejects negative price', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Laptop', price: -10, owner_id: 1 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  it('returns 404 for missing product', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/products/999');
    expect(res.status).toBe(404);
  });
});
