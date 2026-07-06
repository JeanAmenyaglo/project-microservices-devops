const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'users_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await pool.query('SELECT 1');
      console.log('User service connected to PostgreSQL');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id         SERIAL PRIMARY KEY,
          name       VARCHAR(100) NOT NULL,
          email      VARCHAR(150) UNIQUE NOT NULL,
          password   VARCHAR(255) NOT NULL,
          role       VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Users table ready');
      return;
    } catch (err) {
      retries--;
      console.log(`DB not ready. Retries left: ${retries}`);
      if (!retries) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

module.exports = { pool, connectDB };
