const mongoose = require('mongoose');

// Item schema for lost and found listings
const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Electronics', 'ID Card', 'Books', 'Keys', 'Bags', 'Clothing', 'Calculators', 'Other']
    },
    location: {
        type: String,
        required: [true, 'Please specify the location']
    },
    date: {
        type: String,
        required: [true, 'Please specify the date when item was lost/found']
    },
    type: {
        type: String,
        required: [true, 'Type is required (LOST or FOUND)'],
        enum: ['LOST', 'FOUND']
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'RETURNED'],
        default: 'ACTIVE'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Item', itemSchema);
