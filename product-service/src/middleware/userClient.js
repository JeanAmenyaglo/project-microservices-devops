const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

const validateUser = async (req, res, next) => {
  const { owner_id } = req.body;
  if (!owner_id) return res.status(400).json({ error: 'owner_id is required' });
  try {
    const { data } = await axios.get(`${USER_SERVICE_URL}/api/users/${owner_id}`);
    req.user = data.user;
    next();
  } catch (err) {
    if (err.response?.status === 404)
      return res.status(404).json({ error: `User ${owner_id} not found` });
    console.error('User service error:', err.message);
    return res.status(503).json({ error: 'User service unavailable' });
  }
};

module.exports = { validateUser };
