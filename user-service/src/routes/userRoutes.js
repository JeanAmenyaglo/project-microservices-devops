const router = require('express').Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');

router.get('/', getAllUsers);

router.get('/:id', [param('id').isInt()], validate, getUserById);

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, createUser);

router.put('/:id', [param('id').isInt()], validate, updateUser);

router.delete('/:id', [param('id').isInt()], validate, deleteUser);

module.exports = router;
