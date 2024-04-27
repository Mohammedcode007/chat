const mongoose = require('mongoose');

// Define the MessageRoom schema
const MessageRoomSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the sender user
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, // Reference to the recipient room
    content: { type: String, required: true }, // MessageRoom content
    timestamp: { type: Date, default: Date.now }, // Timestamp of when the MessageRoom was sent
    isMe: { type: Boolean, required: true } // Indicates whether the MessageRoom is sent by the current user or not
});

// Create the MessageRoom model
const MessageRoom = mongoose.model('MessageRoom', MessageRoomSchema);

// Export the MessageRoom model
module.exports = MessageRoom;
