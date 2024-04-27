// userController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const Conversation = require('../models/Conversation');
const { sendEmail } = require('../middleware/sendingotp'); // Update the path accordingly

const FriendRequest = require('../models/FriendRequest');




exports.searchByUserId = async (req, res) => {
    const { userId } = req.query;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch user's friends with their details
        const userWithFriends = await User.findById(userId).populate('friends');

        res.status(200).json(userWithFriends); // Send user details with friends' details
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgetpassword = async (req, res) => {
    const { email } = req.body;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

    // Set expiry time to 5 minutes from now
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    try {
        // Send OTP to user's email
        await sendEmail(email, otp);

        // Respond with success message
        res.status(200).json({ "message": "OTP sent to email", "expiry": otpExpiry.toISOString() });
    } catch (error) {
        // Handle errors
        console.error("Error in forgetpassword:", error);
        res.status(500).json({ "message": "Failed to send OTP" });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the received OTP matches the one stored in the database
        if (user.otp !== otp || Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password with the new hashed password
        user.password = hashedPassword;

        // Clear the OTP and OTP expiry fields
        user.otp = undefined;
        user.otpExpiry = undefined;

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchByUsername = async (req, res) => {
    const { username } = req.query;
    const { userId } = req.query; // ID of the user who is performing the search

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ 
                message_en: 'User not found',
                message_ar: 'المستخدم غير موجود'
            });
        }

        // Validate username length and characters
        const usernameRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?/|\\'"~-]{6,40}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ 
                message_en: 'Invalid username format',
                message_ar: 'صيغة اسم المستخدم غير صالحة'
            });
        }

        // Check if the user who searched for this user has previously sent a friend request
        const friendRequest = await FriendRequest.findOne({ sender: userId, receiver: user._id });
        let friendRequestSent = false;
        if (friendRequest) {
            friendRequestSent = true;
        }

        // Check if the searched user is already in the user's friend list
        const loggedInUser = await User.findById(userId);
        let isFriend = false;
        if (loggedInUser.friends.includes(user._id)) {
            isFriend = true;
        }

        // Update the lastSearchBy and lastSearchRequestSent fields for the searched user
        user.lastSearchBy = userId;
        user.lastSearchRequestSent = friendRequestSent; // Set lastSearchRequestSent based on the search result
        await user.save();

        // Inform if the searched user is already a friend
        if (isFriend) {
            return res.status(200).json({ user, friendRequestSent, isFriend: true });
        }

        res.status(200).json({ user, friendRequestSent, isFriend: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





exports.editProfile = async (req, res) => {
    const { userId } = req.query;
    const { username, password, newPassword, status } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update username and status if provided
        if (username) user.username = username;
        if (status) user.status = status;

        // Handle password update if both password and newPassword are provided
        if (password && newPassword) {
            // Handle password update logic
        }

        // Check if both image and imageCover files are uploaded
        if (req.files['image']) {
            // Delete the old image if it exists
            if (user.image) {
                fs.unlinkSync(user.image); // Delete old image file
            }
            user.image = req.files['image'][0].path;
        }

        if (req.files['imageCover']) {
            // Delete the old image cover if it exists
            if (user.imageCover) {
                fs.unlinkSync(user.imageCover); // Delete old image cover file
            }
            user.imageCover = req.files['imageCover'][0].path;
        }

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
      
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





exports.editUser = async (req, res) => {
    const { status, userId, displayName, messageStatus, country, email, dateOfBirth, gender } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the provided status is one of the allowed values
        if (!['online', 'offline', 'busy','at work'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Update the user's status

        // Update other fields if provided
        if (status) user.status = status;
        if (displayName) user.displayName = displayName;
        if (messageStatus) user.messageStatus = messageStatus;
        if (country) user.country = country;
        if (email) user.email = email;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;

        // Save the updated user object
        await user.save();
        const userWithFriends = await User.findById(user.id).populate('friends');

        res.status(200).json({ message_en: 'User updated successfully', message_ar: 'تم التعديل',   user: userWithFriends, 
    });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getAllFriends = async (req, res) => {
    const { userId } = req.body;

    try {
        // Find the user by userId
        const user = await User.findById(userId).populate('friends');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ friends: user.friends });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Function to delete a friend
exports.deleteFriend = async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the friend by friendId
        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        // Remove the friend from the user's friend list
        user.friends.pull(friendId);
        await user.save();

        // Remove the user from the friend's friend list (optional, depending on your application logic)
        friend.friends.pull(userId);
        await friend.save();

        // Delete any friend requests between the user and the friend (optional, depending on your application logic)
        await FriendRequest.deleteMany({ $or: [{ sender: userId, receiver: friendId }, { sender: friendId, receiver: userId }] });

        // Delete all conversations involving both the user and the friend
        await Conversation.deleteMany({ $or: [{ participants: [userId, friendId] }, { participants: [friendId, userId] }] });

        res.status(200).json({ message: 'Friend deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
