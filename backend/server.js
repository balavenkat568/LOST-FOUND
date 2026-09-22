const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/Message');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server instance for Express & Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Root route fallback to frontend index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Socket.IO Real-Time Messaging Connection Handler
io.on('connection', (socket) => {
    console.log(`⚡ New socket client connected: ${socket.id}`);

    // Join specific item chat room (Room ID: item_<itemId>)
    socket.on('join_room', (data) => {
        const roomName = `item_${data.itemId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    // Handle real-time sending of messages
    socket.on('send_message', async (data) => {
        try {
            const { senderId, receiverId, itemId, messageText } = data;

            if (!senderId || !receiverId || !itemId || !messageText) {
                return;
            }

            // Save message directly to MongoDB
            let newMsg = await Message.create({
                sender: senderId,
                receiver: receiverId,
                itemId: itemId,
                message: messageText.trim()
            });

            // Populate sender & receiver details
            newMsg = await newMsg.populate('sender', 'name email');
            newMsg = await newMsg.populate('receiver', 'name email');

            const roomName = `item_${itemId}`;
            // Broadcast message to all clients in the item chat room
            io.to(roomName).emit('receive_message', newMsg);
        } catch (err) {
            console.error('Socket send_message error:', err.message);
        }
    });

    // Typing indicator event
    socket.on('typing', (data) => {
        const roomName = `item_${data.itemId}`;
        socket.to(roomName).emit('user_typing', {
            username: data.username,
            isTyping: true
        });
    });

    // Stop typing indicator event
    socket.on('stop_typing', (data) => {
        const roomName = `item_${data.itemId}`;
        socket.to(roomName).emit('user_typing', {
            username: data.username,
            isTyping: false
        });
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Start listening on specified port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`====================================================`);
});
