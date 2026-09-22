const mongoose = require('mongoose');

// Function to connect to MongoDB database
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-lost-found';
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Exit process with failure if database connection fails
        process.exit(1);
    }
};

module.exports = connectDB;
