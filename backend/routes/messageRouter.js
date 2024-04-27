// routers/messageRouter.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/get_messages', messageController.getAllMessages);
router.post('/create_message', messageController.createMessage);
router.delete('/:id', messageController.deleteMessage);
router.get('/start-conversation', messageController.startConversation); 
// router.delete('/delete_message', messageController.deleteConversation);
router.post('/seen-message', messageController.markMessageSeen);
router.get('/updateDeliveredStatus', messageController.updateDeliveredStatus);
router.get('/updateSeenStatus', messageController.updateSeenStatus);
router.post('/updateSeenStatusopenchat', messageController.updateOpenStatus);
router.post('/markMessageDelivered', messageController.markMessageDelivered);


router.post('/receive-message', messageController.messageReceived);

module.exports = router;
