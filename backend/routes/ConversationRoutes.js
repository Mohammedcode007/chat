// routers/messageRouter.js

const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/ConversationController');

router.get('/conversation', conversationController.getAllConversations);
router.post('/delete_conversation', conversationController.deleteConversation);
router.post('/sendmessage', conversationController.sendMessage);
router.get('/getmessages', conversationController.getAllMessagesInConversation);
router.get('/getallconverstion', conversationController.getConversationsByUserId);
router.post('/getoneconverstion', conversationController.getConversationByUserIds);
router.put('/editParticipantsStatus', conversationController.editParticipantsStatus);


module.exports = router;
