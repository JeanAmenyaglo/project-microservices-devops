const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) =>
  res.json({ status: 'healthy', service: 'user-service', timestamp: new Date().toISOString() })
);

app.get('/ready', (req, res) =>
  res.json({ status: 'ready', service: 'user-service', timestamp: new Date().toISOString() })
);

app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
