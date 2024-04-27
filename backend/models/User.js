const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    messageStatus: { type: String, default: 'Hello World' }, // Set default value if not provided
    image: { type: String ,default:"public\\images\\image_1713141492152.png"}, // Add image field to store profile image URL
    imageCover: { type: String ,default:"public\\images\\image_1713141492152.png"}, // Add image field to store profile image URL
    country: { type: String, default: 'world' }, // Set default value if not provided
    displayName: { type: String, default: 'my displayName' }, // Set default value if not provided
    dateOfBirth: { type: String, default: '12/4/1885' }, // Set default value if not provided
    gender: { type: String, default: 'femal' }, // Set default value if not provided
    email: { type: String, default: 'info@example.com' }, // Set default value if not provided

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of user IDs
    lastSearchBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Last user who searched for this user
    lastSearchRequestSent: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now }, // تاريخ آخر نشاط للمستخدم
    status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' }, // حالة الاتصال (متصل، غير متصل، بعيد)
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],

});

const User = mongoose.model('User', userSchema);

module.exports = User;
