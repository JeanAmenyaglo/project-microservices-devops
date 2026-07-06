const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) =>
  res.json({ status: 'healthy', service: 'product-service', timestamp: new Date().toISOString() })
);

app.get('/ready', (req, res) =>
  res.json({ status: 'ready', service: 'product-service', timestamp: new Date().toISOString() })
);

app.use('/api/products', productRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
