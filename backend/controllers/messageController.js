// controllers/messageController.js

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');


// Function to get all messages
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Function to create a new message
exports.createMessage = async (req, res) => {
    const { content, conversationId, sender, recipient,isSend,delivered,seen } = req.body;
    const isMe = sender === req.body.id; // Assuming req.user.id contains the ID of the currently logged-in user
    try {
        // Check if the sender and recipient belong to the specified conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(400).json({ message: 'Conversation not found' });
        }
        const participants = conversation.participants.map(participant => participant.toString());
        if (!participants.includes(sender) || !participants.includes(recipient)) {
            return res.status(400).json({ message: 'Sender or recipient not part of the conversation' });
        }

        // Create a new message for the specified conversation
        const message = new Message({
            sender,
            recipient,
            content,
            isSend,
            conversation: conversationId,
            seen,
            isMe,
            delivered,
        });

        const newMessage = await message.save();

        // Add the new message to the conversation
        conversation.messages.push(newMessage._id);
        conversation.lastMessage = newMessage._id;

        await conversation.save();

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};





// Function to delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const deletedMessage = await Message.findOneAndDelete({ _id: req.query.id });
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted', deletedMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.startConversation = async (req, res) => {
    const { sender, recipient, content, isSend } = req.query;
    const isMe = sender === req.query.id; // Assuming req.user.id contains the ID of the currently logged-in user
    try {
        // Determine if the sender is the currently logged-in user

        // Create a new message to initiate the conversation
        const message = new Message({
            sender,
            recipient,
            content,
            isSend,
            isMe, // Set the isMe field
            delivered: false // Assuming the message is not delivered yet
        });

        const newMessage = await message.save();

        // Check if there's already an existing conversation between the two users
        const existingConversation = await Conversation.findOne({
            participants: { $all: [sender, recipient] }
        });

        if (existingConversation) {
            // If the conversation exists, return its details along with message details
            const conversationWithMessages = await Conversation.findOne({ _id: existingConversation._id }).populate('messages');
            return res.status(200).json(conversationWithMessages);
        }

        // If the conversation doesn't exist, create it
        const conversation = new Conversation({
            participants: [recipient, sender], // Change participants to an array
            messages: [newMessage._id],
            participantsStatus: [
                { user: recipient, isOpen: false }, // Set isOpen to true for recipient
                { user: sender, isOpen: true } // Assuming sender is currently opening the conversation page
            ]
        });

        const newConversation = await conversation.save();

        // Populate message details and return
        const conversationWithNewMessage = await Conversation.findOne({ _id: newConversation._id }).populate('messages');

        res.status(201).json(conversationWithNewMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};






// عند استلام الرسالة
exports.messageReceived = async (req, res) => {
    const {messageId} = req.query; // Assume the message ID is provided in the request

    try {
        // Find the message by ID
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Update the "delivered" status to true
        await Message.updateOne({ _id: messageId }, { $set: { delivered: true } });

        res.json({ message: 'Message delivered' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};





exports.markMessageDelivered = async (req, res) => {
    const { recipientId } = req.body; // نفترض أن معرف المستلم موجود في معلمات الطلب
console.log(recipientId);
    try {
        // تحديث جميع الرسائل التي تم إرسالها للمستلم والتي لم تُسلم بعد لتصبح مُسلمة
        await Message.updateMany({ recipient: recipientId, delivered: false }, { $set: { delivered: true } });

        res.json({ message: 'تم تحديد جميع الرسائل كمستلمة' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.markMessageSeen = async (req, res) => {
    const { messageId } = req.query; // Assume the message ID is provided in the request parameters

    try {
        // Find the message by ID
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Update the "seen" status to true
        await Message.updateOne({ _id: messageId }, { $set: { seen: true } });

        res.json({ message: 'Message marked as seen' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Import the Message model

// Function to check if a user has undelivered messages
exports.updateDeliveredStatus = async (req, res) => {
    const userId = req.query.userId; // Assuming the user ID is provided in the request parameters
    try {
        // Find undelivered messages for the user
        const undeliveredMessages = await Message.find({ recipient: userId, delivered: false });
        // Check if any undelivered messages were found
        if (undeliveredMessages.length === 0) {
            return res.json({ message: 'No undelivered messages found for the user' });
        }

        // Update the delivered status of each undelivered message
        for (const message of undeliveredMessages) {
            message.delivered = true;
            await message.save();
        }

        res.json({ message: 'Delivered status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Function to update the seen status of messages for a user
exports.updateSeenStatus = async (req, res) => {
    const userId = req.query.userId; 

    try {
        // Update the seen status of unseen messages for the user
        const result = await Message.updateMany(
            { recipient: userId, seen: false }, // Filter criteria
            { $set: { seen: true } } // Update operation
        );

        // Check if any messages were updated
        if (result.nModified === 0) {
            return res.json({ message: 'No unseen messages found for the user' });
        }

        res.json({ message: 'Seen status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




exports.updateOpenStatus = async (req, res) => {
    const { conversationId, userId, isOpen } = req.body;

    try {
        // Find the conversation by its ID
        const conversation = await Conversation.findById(conversationId);

        // Check if the conversation exists
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Find the participant status for the user in the conversation
        const participantStatus = conversation.participantsStatus.find(status => status.user.equals(userId));

        // If participant status not found, return an error
        if (!participantStatus) {
            return res.status(404).json({ message: 'Participant not found in conversation participants' });
        }

        // Update the isOpen status for the participant
        participantStatus.isOpen = isOpen;

        // Save the updated conversation
        await conversation.save();

        res.json({ message: 'Open status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};