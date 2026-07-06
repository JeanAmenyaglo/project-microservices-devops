const { pool } = require('../models/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashed, role || 'user']
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email), updated_at=NOW()
       WHERE id=$3 RETURNING id, name, email, role, updated_at`,
      [name, email, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING id', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
