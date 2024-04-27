const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ 
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isSend: { type: Boolean, required: true },

    seen: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
    isMe: { type: Boolean, required: true }
    }],
    isPending: { type: Boolean, default: false },
    messageStatus: { type: String, default: ''},

    password: { type: String, default: null },
    none: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    banList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    owner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
 
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Creator of the room
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
