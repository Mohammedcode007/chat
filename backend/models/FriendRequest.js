// models/FriendRequest.js

const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // معرف المستخدم الراسل
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // معرف المستخدم المرسل إليه
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // حالة الطلب
    requestSent: { type: Boolean, default: true } // يحدد ما إذا كان تم إرسال طلب الصداقة من قبل المرسل سابقًا
});

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
