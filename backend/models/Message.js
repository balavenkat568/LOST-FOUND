const mongoose = require('mongoose');

// Message schema for item-specific private conversations
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Message content cannot be empty'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);
