const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    participantsStatus: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        isOpen: { type: Boolean, default: false },
        isTyping: { type: Boolean, default: false } 

    }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' } // Reference to the last message in the conversation
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
