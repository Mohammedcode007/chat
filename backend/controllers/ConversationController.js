const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User"); // استيراد نموذج المستخدم

exports.getAllConversations = async (req, res) => {
    const { userId } = req.query;

    try {
        // العثور على المحادثات التي يكون المستخدم مشاركًا فيها
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'messages',
                model: 'Message'
            })
            .populate({
                path: 'lastMessage',
                model: 'Message'
            })
            .populate({
                path: 'participants',
                model: 'User',
                // تحديد الشرط بناءً على معرف المستخدم
                match: { _id: { $ne: userId } } // لا يساوي userId
            });

        // جلب حالة المشاركين وتضمينها في كل محادثة
        for (const conversation of conversations) {
            for (const participant of conversation.participants) {
                const user = await User.findById(participant._id);
                participant.status = user.status; // افتراض أن حالة المستخدم مخزنة في حقل يسمى "status"
            }
        }

        res.status(200).json({ conversations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteConversation = async (req, res) => {
    const conversationId = req.query.id; // Assuming the conversation ID is provided in the request parameters

    try {
        // Find the conversation by ID
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Delete all associated messages
        await Message.deleteMany({ conversation: conversationId });

        // Delete the conversation itself
        await Conversation.deleteOne({ _id: conversationId });

        res.json({ message: 'Conversation deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.sendMessage = async (req, res) => {
    const { senderId, recipientId, content, type, delivered, seen } = req.body;
    try {
        // Check if conversation exists between sender and recipient
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        // If conversation doesn't exist, create a new one
        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId]
            });
            await conversation.save();

            // Add participantsStatus only if the conversation is newly created
            conversation.participantsStatus.push(
                { user: senderId, isOpen: false },
                { user: recipientId, isOpen: false }
            );
        } else {
            // Check if participantsStatus already exists for sender and recipient
            const senderStatus = conversation.participantsStatus.find(status => status.user.equals(senderId));
            const recipientStatus = conversation.participantsStatus.find(status => status.user.equals(recipientId));

            // If not found, add participantsStatus for sender and recipient
            if (!senderStatus) {
                conversation.participantsStatus.push({ user: senderId, isOpen: false });
            }
            if (!recipientStatus) {
                conversation.participantsStatus.push({ user: recipientId, isOpen: false });
            }
        }

        // Create the message
        const message = new Message({
            sender: senderId,
            recipient: recipientId,
            content: content,
            isSend: true,
            delivered: delivered,
            seen: seen,
            type: type // Assuming the sender is the currently logged-in user
        });

        // Add the message to the conversation
        conversation.messages.push(message);
        conversation.lastMessage = message;

        await conversation.save();

        // Save the message
        await message.save();

        res.status(200).json({ message: "Message sent successfully", message: message });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.editParticipantsStatus = async (req, res) => {
    const { conversationId, userId, isOpen,isTyping } = req.body; // Assuming the conversation ID is provided in the request parameters

    try {
        // Find the conversation by its ID
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Find the participant status object in the participantsStatus array
        const participantStatus = conversation.participantsStatus.find(status => status.user.equals(userId));

        if (!participantStatus) {
            return res.status(404).json({ success: false, message: 'Participant status not found in conversation' });
        }

        // Update isOpen for the existing participant
        participantStatus.isOpen = isOpen;
        participantStatus.isTyping = isTyping;

        // Save the conversation
        await conversation.save();

        return res.status(200).json({ conversation: conversation });
    } catch (error) {
        console.error('Error editing participants status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



exports.getAllMessagesInConversation = async (req, res) => {
    const { conversationId } = req.body; // Assuming the conversation ID is provided in the URL parameters

    try {
        // Find the conversation by ID and populate the messages field
        const conversation = await Conversation.findById(conversationId)
            .populate({
                path: 'messages',
                model: 'Message'
            });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Retrieve all messages associated with the conversation
        const messages = conversation.messages;

        res.status(200).json({ messages });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getConversationsByUserId = async (req, res) => {
    const { userId } = req.body; // Assuming the user ID is provided in the URL parameters

    try {
        // Find all conversations where the user is a participant
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'messages',
                model: 'Message'
            })
            .populate({
                path: 'lastMessage',
                model: 'Message'
            })
            .populate({
                path: 'participants',
                model: 'User',
                // Exclude the current user from the participants list
                match: { _id: { $ne: userId } }
            });

        res.status(200).json({ conversations });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getConversationByUserIds = async (req, res) => {
    const { userId1, userId2 } = req.body;
    try {
        // Find conversation between two users
        const conversation = await Conversation.findOne({
            participants: { $all: [userId1, userId2] }
        }).populate('messages');

        if (!conversation) {
            // If conversation doesn't exist, return a message indicating so
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // If conversation exists, return it
        res.status(200).json({ conversation });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

