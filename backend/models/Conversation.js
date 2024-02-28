const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Participants in the conversation
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // Messages exchanged in the conversation
    participantsStatus: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        isOpen: { type: Boolean, default: false } 
    }] // Status of conversation page opening for each participant
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
