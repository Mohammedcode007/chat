const express = require('express');
const http = require('http');
const { Server } = require("socket.io");


const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/FriendRequestRoutes');
const messageRoutes = require('./routes/messageRouter');
const path = require('path');

const cors = require('cors'); // Import cors package

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server)
app.use('/src/Images', express.static(path.join(__dirname, 'src', 'Images')));

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI,)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Enable CORS
app.use(cors());

// Use user routes
app.use('/api/users', userRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/message', messageRoutes);


// Socket.IO logic
io.on('connection', (socket) => {
console.log('Socket connected:', socket.id);
socket.on("friendRequestSent",(data)=>{
socket.emit("friendRequestRecive",data)
})

socket.on('sendMessage', (messageData) => {
    // Broadcast the message to all connected clients
    io.emit('receiveMessage', messageData);
});

socket.on('friendLogin', (userData) => {
    // Broadcast the message to all connected clients
    io.emit('receiveUpdateFriends', userData);
});

    // Listen for disconnection
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        // Handle disconnection logic here if needed
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { io }; // Ensure io is exported for use in other files
