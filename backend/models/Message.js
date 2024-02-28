const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isSend: { type: Boolean, required: true },

    seen: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
    isMe: { type: Boolean, required: true } // Indicates if the message is sent by the currently logged-in user
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
