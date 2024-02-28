// userRoutes.js

const express = require('express');
const router = express.Router();
const FriendRequestController = require('../controllers/FriendRequestController');

// مسار لإرسال طلب الصداقة
router.post('/send-friend-request', FriendRequestController.sendFriendRequest);

// مسار لمعالجة الطلبات الواردة للصداقة
router.post('/respond-to-friend-request', FriendRequestController.respondToFriendRequest);
router.get('/get-friend-request', FriendRequestController.getFriendRequests);

module.exports = router;
