const Item = require('../models/Item');

// @desc    Create a new lost or found item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
    try {
        const { title, description, category, location, date, type } = req.body;

        // Field validations
        if (!title || !description || !category || !location || !date || !type) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (!['LOST', 'FOUND'].includes(type)) {
            return res.status(400).json({ message: 'Type must be either LOST or FOUND' });
        }

        // Create item with current user as poster
        const item = await Item.create({
            title,
            description,
            category,
            location,
            date,
            type,
            status: 'ACTIVE',
            postedBy: req.user._id
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Create Item Error:', error);
        res.status(500).json({ message: 'Failed to create item' });
    }
};

// @desc    Get all items with search & filtering options
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
    try {
        const { search, type, category, status, location } = req.query;

        // Build Mongoose filter object
        let query = {};

        // Filter by title (case-insensitive regex search)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Filter by type (LOST / FOUND)
        if (type && type !== 'ALL') {
            query.type = type;
        }

        // Filter by category
        if (category && category !== 'ALL') {
            query.category = category;
        }

        // Filter by status (ACTIVE / RETURNED)
        if (status && status !== 'ALL') {
            query.status = status;
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Fetch items sorted by newest first and populate poster info
        const items = await Item.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(items);
    } catch (error) {
        console.error('Get Items Error:', error);
        res.status(500).json({ message: 'Failed to fetch items' });
    }
};

// @desc    Get single item details by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('postedBy', 'name email');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Get Item By ID Error:', error);
        // Handle invalid MongoDB ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid Item ID format' });
        }
        res.status(500).json({ message: 'Server error retrieving item' });
    }
};

// @desc    Update item listing (e.g. edit details or mark RETURNED)
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // AUTHORIZATION CHECK: Only the user who created the item can update it
        if (item.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        // Update fields if provided
        item.title = req.body.title || item.title;
        item.description = req.body.description || item.description;
        item.category = req.body.category || item.category;
        item.location = req.body.location || item.location;
        item.date = req.body.date || item.date;
        item.type = req.body.type || item.type;
        item.status = req.body.status || item.status;

        const updatedItem = await item.save();
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Update Item Error:', error);
        res.status(500).json({ message: 'Failed to update item' });
    }
};

// @desc    Delete an item listing
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // AUTHORIZATION CHECK: Only the user who created the item can delete it
        if (item.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await item.deleteOne();
        res.status(200).json({ message: 'Item listing removed successfully' });
    } catch (error) {
        console.error('Delete Item Error:', error);
        res.status(500).json({ message: 'Failed to delete item' });
    }
};

// @desc    Get listings created by currently logged-in user
// @route   GET /api/items/user/my
// @access  Private
const getMyItems = async (req, res) => {
    try {
        const items = await Item.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        console.error('Get My Items Error:', error);
        res.status(500).json({ message: 'Failed to fetch your items' });
    }
};

module.exports = {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
    getMyItems
};
