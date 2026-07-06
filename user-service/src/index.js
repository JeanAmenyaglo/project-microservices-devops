require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./models/db');

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
};

start();
