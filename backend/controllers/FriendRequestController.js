// userController.js
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// userController.js

exports.sendFriendRequest = async (req, res) => {
    const { senderId, receiverId } = req.body;
    const io = require('../index').io; // Importing io when needed

    try {
        const sender = await User.findById(senderId);

        // Check if the request already exists
        const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
        if (existingRequest) {
            return res.status(200).json({ message: 'Friend request already sent', existingRequest, sender });
        }

        // Check if the users exist
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        // Check if receiver is already in the friend list
        if (sender.friends.includes(receiverId)) {
            return res.status(200).json({ message: 'User is already a friend', sender });
        }

        // Create the friend request using the model
        const request = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
            requestSent: true // Set requestSent to true since the request is being sent now
        });

        // Save the friend request to the database
        await request.save();

        io.emit('friendRequestSent', request);

        // Sending the sender data along with the response
        res.status(200).json({ message: 'Friend request sent successfully', sender, request, requestId: request._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




exports.getFriendRequests = async (req, res) => {
    const { userId } = req.query; // Logged-in user ID
    const io = require('../index').io; // Delay importing io until it's needed

    try {
        // Find all friend requests involving the user as sender or receiver
        const friendRequests = await FriendRequest.find({
            $or: [
                { receiver: userId },
            ]
        }).populate('sender'); // Populate the 'sender' field with user data

        // Emit event with updated friend requests data
        io.emit('friendRequestsUpdate', friendRequests);

        // Extracting _id from each friend request and constructing the response
        const response = friendRequests.map(request => ({ ...request.toJSON(), requestId: request._id }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.respondToFriendRequest = async (req, res) => {
    const { requestId, response } = req.body;

    try {
        // Find the request using the requestId
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Here the incoming request should be handled and accepted or rejected
        if (response === 'accept') {
            // Accept the request
            // Find the user who sent the request
            const sender = await User.findById(friendRequest.sender);
            if (!sender) {
                return res.status(404).json({ message: 'User who sent the request not found' });
            }

            // Find the user to be added to the friend list
            const receiver = await User.findById(friendRequest.receiver);
            if (!receiver) {
                return res.status(404).json({ message: 'User to be added to friend list not found' });
            }

            // Add the user to the receiver's friend list
            receiver.friends.push(sender);
            await receiver.save();

            // Add the user to the sender's friend list as well
            sender.friends.push(receiver);
            await sender.save();

            // Delete the request from the database after acceptance
            await FriendRequest.findByIdAndDelete(requestId);

            res.status(200).json({ message: 'Friend request accepted successfully' });
        } else if (response === 'reject') {
            // Reject the request
            // Delete the request from the database
            await FriendRequest.findByIdAndDelete(requestId);

            res.status(200).json({ message: 'Friend request rejected successfully' });
        } else {
            res.status(400).json({ message: 'Invalid response' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
