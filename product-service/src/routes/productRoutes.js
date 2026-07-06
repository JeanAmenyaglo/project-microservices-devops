const router = require('express').Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { validateUser } = require('../middleware/userClient');
const {
  getAllProducts, getProductById, getProductsByOwner,
  createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/owner/:owner_id', [param('owner_id').isInt()], validate, getProductsByOwner);
router.get('/:id', [param('id').isInt()], validate, getProductById);

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('owner_id').isInt().withMessage('owner_id must be an integer'),
], validate, validateUser, createProduct);

router.put('/:id', [param('id').isInt()], validate, updateProduct);
router.delete('/:id', [param('id').isInt()], validate, deleteProduct);

module.exports = router;
