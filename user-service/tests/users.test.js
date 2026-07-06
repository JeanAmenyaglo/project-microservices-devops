const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/models/db', () => ({
  pool: { query: jest.fn() },
  connectDB: jest.fn(),
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

describe('GET /api/users', () => {
  it('returns users list', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Jean', email: 'jean@test.com' }] });
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
  });
});

describe('POST /api/users', () => {
  it('creates a user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Jean', email: 'jean@test.com', role: 'user' }] });
    const res = await request(app).post('/api/users').send({ name: 'Jean', email: 'jean@test.com', password: 'password123' });
    expect(res.status).toBe(201);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Jean', email: 'bad', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Jean', email: 'jean@test.com', password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/users/:id', () => {
  it('returns 404 for missing user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/users/999');
    expect(res.status).toBe(404);
  });
});
