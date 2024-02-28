// userController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const { generateToken } = require('../Utils/authUtils');
const FriendRequest = require('../models/FriendRequest');
const upload = require('../middleware/multer')
exports.signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if image data is provided in the request
        let image;
        if (req.file) {
            image = req.file.path; // Assuming you're using multer or similar middleware for handling file uploads
        }

        // Create a new user instance
        const newUser = new User({ 
            username, 
            password: hashedPassword,
            image // Add the image field to the user object
        });

        // Save the user to the database
        await newUser.save();

        // Sending response with user data
        res.status(201).json({ message: 'Signup successful', user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Username not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Generate a token upon successful login
        const token = generateToken(user.id);

        // Fetch user's friends with their details
        const userWithFriends = await User.findById(user.id).populate('friends');

        // Sending user data with friends' usernames
        res.status(200).json({ message: 'Login successful', user: userWithFriends, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


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


// userController.js

// userController.js

exports.searchByUsername = async (req, res) => {
    const { username } = req.query;
    const { userId } = req.query; // ID of the user who is performing the search

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user who searched for this user has previously sent a friend request
        const friendRequest = await FriendRequest.findOne({ sender: userId, receiver: user._id });
        let friendRequestSent = false;
        if (friendRequest) {
            friendRequestSent = true;
        }

        // Update the lastSearchBy and lastSearchRequestSent fields for the searched user
        user.lastSearchBy = userId;
        user.lastSearchRequestSent = friendRequestSent; // Set lastSearchRequestSent based on the search result
        await user.save();

        res.status(200).json({ user, friendRequestSent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.editProfile = async (req, res) => {
    const { userId } = req.query;
    const { username, password, newPassword,status } = req.body;

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

        // Handle image upload with multer middleware
        upload.single('image')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(500).json({ message: err.message });
            }

            // If image upload succeeds, update user profile with image path
            if (req.file) {
                user.image = req.file.path;
            }

            // Save the updated user object
            await user.save();

            res.status(200).json({ message: 'Profile updated successfully', user });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.editStatus = async (req, res) => {
    const { status,userId } = req.body;
    console.log(status,userId);
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the provided status is one of the allowed values
        if (!['online', 'offline', 'busy'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Update the user's status
        user.status = status;

        // Save the updated user object
        await user.save();
console.log(user);
        res.status(200).json({ message: 'Status updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
