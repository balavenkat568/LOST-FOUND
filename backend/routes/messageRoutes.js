const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getItemMessages,
    getUserConversations
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes are protected
router.post('/', protect, sendMessage);
router.get('/conversations/my', protect, getUserConversations);
router.get('/:itemId', protect, getItemMessages);

module.exports = router;
