# 🎓 Campus Lost & Found Platform

A centralized, real-time web application for college students to report, search, and recover lost and found belongings on campus.

---

## 📌 Problem Statement

College students frequently misplace or find essential personal belongings on campus, such as:
* Student ID Cards
* Wallets & Purses
* Textbooks & Notebooks
* Earphones & Headsets
* Calculators (e.g., Casio FX-991ES)
* USB Drives & Flash drives
* Keys & Lanyards
* Bags & Backpacks
* Laptops & Accessories

Currently, students rely on informal WhatsApp groups, Telegram chats, or word of mouth. These messages get buried quickly, leading to low item recovery rates, privacy concerns, and lack of verified ownership handover.

---

## 💡 Solution

The **Campus Lost & Found Platform** provides a structured, searchable dashboard and private real-time communication system.

Students can:
1. **Report Lost Items** with details, location, and dates.
2. **Report Found Items** to help fellow students.
3. **Search & Filter** listings by item title, category (Electronics, ID Card, Books, etc.), type (LOST/FOUND), and status (ACTIVE/RETURNED).
4. **Privately Chat** using Socket.IO without revealing personal phone numbers or emails publicly.
5. **Verify Ownership** securely over real-time chat (describing scratches, stickers, marks).
6. **Mark as Returned** once the item is safely returned to its owner.

---

## ✨ Features

* 🔐 **Authentication & Security**: Secure student signup and login using bcrypt password hashing and JSON Web Tokens (JWT).
* 📋 **Item Listing Management**: Full CRUD capabilities for lost and found items.
* 🛡️ **Authorization Controls**: Strict ownership checks; only the student who posted an item can edit, delete, or mark it as returned.
* 🔍 **Smart Search & Filters**: Search listings by title keyword, filter by LOST/FOUND, category, and status.
* 💬 **Real-time Private Chat**: Built with Socket.IO & MongoDB persistence. Chat threads are tied directly to specific item listings.
* ⌨️ **Typing Indicators**: Real-time typing status feedback during active messaging.
* 📱 **Responsive UI**: Clean, accessible layout built with Bootstrap 5 and Vanilla JavaScript.

---

## 🛠️ Technology Stack

### Frontend
* **HTML5 & CSS3**
* **Bootstrap 5** (CDN)
* **Vanilla JavaScript (ES6+)**
* **Fetch API**
* **Socket.IO Client**

### Backend
* **Node.js**
* **Express.js**

### Database
* **MongoDB**
* **Mongoose ODM**

### Authentication & Real-Time
* **bcryptjs** (Password hashing)
* **jsonwebtoken** (JWT Auth)
* **Socket.IO** (Real-time WebSocket communication)

---

## 🏗️ Architecture

```text
Browser (HTML/Bootstrap/JS)
      │
      ├─► Fetch API (HTTP REST) ──► Express.js Controllers ──► Mongoose ──► MongoDB
      │
      └─► Socket.IO (WebSocket) ─► Node.js Socket Server ───► Mongoose ──► MongoDB
```

---

## 🗄️ Database Models

### 1. User Model
```javascript
{
    name: String,
    email: { type: String, unique: true },
    password: String, // Hashed with bcrypt
    createdAt: Date
}
```

### 2. Item Model
```javascript
{
    title: String,
    description: String,
    category: Enum['Electronics', 'ID Card', 'Books', 'Keys', 'Bags', 'Clothing', 'Calculators', 'Other'],
    location: String,
    date: String,
    type: Enum['LOST', 'FOUND'],
    status: Enum['ACTIVE', 'RETURNED'],
    postedBy: ObjectId (Ref User),
    createdAt: Date
}
```

### 3. Message Model
```javascript
{
    sender: ObjectId (Ref User),
    receiver: ObjectId (Ref User),
    itemId: ObjectId (Ref Item),
    message: String,
    createdAt: Date
}
```

---

## 🌐 REST API Endpoints

### Authentication
* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Authenticate user & receive JWT token
* `GET /api/auth/me` - Get current user profile (Protected)

### Items
* `GET /api/items` - Search and filter item listings
* `GET /api/items/:id` - View details for a specific item
* `POST /api/items` - Post a new lost/found item (Protected)
* `GET /api/items/user/my` - View listings posted by logged-in user (Protected)
* `PUT /api/items/:id` - Update listing / Mark RETURNED (Protected & Owner only)
* `DELETE /api/items/:id` - Delete listing (Protected & Owner only)

### Messages
* `POST /api/messages` - Send a private message (Protected)
* `GET /api/messages/:itemId` - Fetch chat history for an item (Protected)
* `GET /api/messages/conversations/my` - Get active conversation threads (Protected)

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) running locally or MongoDB Atlas connection string.

### 2. Installation
Clone the repository and install npm dependencies:

```bash
cd campus-lost-found
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campus-lost-found
JWT_SECRET=super_secret_campus_lost_found_jwt_key_2026
```

### 4. Running the Application
Start the Node.js server:

```bash
npm start
```

Open your web browser and navigate to:
```text
http://localhost:5000
```

---



## 🔮 Future Improvements

* 📷 **Image Uploads**: Allow students to attach photo evidence of found items.
* 📧 **Email Notifications**: Alert item owners when a message is received.
* 🤖 **AI Item Matching**: Automatically suggest matching lost & found pairs based on title & location.
* 🛡️ **Admin Dashboard**: Moderation tools for campus administration staff.
