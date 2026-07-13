const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Prometheus setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.path, res.statusCode)
      .observe(duration);
    httpRequestTotal
      .labels(req.method, req.path, res.statusCode)
      .inc();
  });
  next();
});

app.get('/health', (req, res) =>
  res.json({ status: 'healthy', service: 'user-service', timestamp: new Date().toISOString() })
);

app.get('/ready', (req, res) =>
  res.json({ status: 'ready', service: 'user-service', timestamp: new Date().toISOString() })
);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;