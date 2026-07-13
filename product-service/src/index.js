require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./models/db');

const PORT = process.env.PORT || 3002;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Product service running on port ${PORT}`));
};

start();
