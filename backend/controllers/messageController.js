const Message = require('../models/Message');
const Item = require('../models/Item');

// @desc    Send a new message regarding an item
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, itemId, message } = req.body;

        if (!receiverId || !itemId || !message) {
            return res.status(400).json({ message: 'Receiver ID, Item ID, and message text are required' });
        }

        // Verify item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Associated item not found' });
        }

        // Save message to database
        let newMessage = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            itemId: itemId,
            message: message.trim()
        });

        // Populate sender and receiver info for client consumption
        newMessage = await newMessage.populate('sender', 'name email');
        newMessage = await newMessage.populate('receiver', 'name email');
        newMessage = await newMessage.populate('itemId', 'title type status');

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// @desc    Get message history for a specific item conversation
// @route   GET /api/messages/:itemId
// @access  Private
const getItemMessages = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const userId = req.user._id;

        // Retrieve messages for this item where logged-in user is sender or receiver
        const messages = await Message.find({
            itemId: itemId,
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ createdAt: 1 }); // Oldest first for chat timeline

        res.status(200).json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ message: 'Failed to retrieve message history' });
    }
};

// @desc    Get list of active conversations for logged in user
// @route   GET /api/messages/conversations/my
// @access  Private
const getUserConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all messages involving the user
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .populate('itemId', 'title type status location category')
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ createdAt: -1 });

        // Group by itemId to show distinct conversation threads
        const conversationMap = new Map();
        messages.forEach(msg => {
            if (msg.itemId && !conversationMap.has(msg.itemId._id.toString())) {
                const otherParty = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
                conversationMap.set(msg.itemId._id.toString(), {
                    item: msg.itemId,
                    otherUser: otherParty,
                    lastMessage: msg.message,
                    lastMessageTime: msg.createdAt
                });
            }
        });

        const conversations = Array.from(conversationMap.values());
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ message: 'Failed to retrieve conversation list' });
    }
};

module.exports = {
    sendMessage,
    getItemMessages,
    getUserConversations
};
