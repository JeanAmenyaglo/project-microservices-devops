const { pool } = require('../models/db');

const getAllProducts = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const getProductsByOwner = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE owner_id=$1 ORDER BY created_at DESC',
      [req.params.owner_id]
    );
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, stock, owner_id } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, stock, owner_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, description, price, stock || 0, owner_id]
    );
    res.status(201).json({ product: rows[0], owner: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const updateProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products SET name=COALESCE($1,name), description=COALESCE($2,description),
       price=COALESCE($3,price), stock=COALESCE($4,stock), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, description, price, stock, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = { getAllProducts, getProductById, getProductsByOwner, createProduct, updateProduct, deleteProduct };
