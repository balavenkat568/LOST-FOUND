const express = require('express');
const router = express.Router();
const {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
    getMyItems
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

// Public item routes
router.get('/', getItems);
router.get('/:id', getItemById);

// Protected item routes
router.post('/', protect, createItem);
router.get('/user/my', protect, getMyItems);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
