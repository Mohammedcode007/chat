const Room = require('../models/Room');
const User = require('../models/User');


exports.CreateRoom = async (req, res) => {
    try {
        const { name, creator } = req.body;

        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ error: 'Room already exists' });
        }


        const room = new Room({
            name,
            creator,
        });

        await room.save();

        res.status(201).json({ message: 'Room created successfully', room });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.getAllRoomsSortedByUsers = async (req, res) => {
    try {
        const rooms = await Room.find({})
            .populate('users')
            .sort({ 'users': -1 }); // Sort by the number of users in descending order

        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.editRoom = async (req, res) => {
    try {
        const { action, roomId } = req.body; // Action to perform
        let updates = req.body; // All other updates

        // Remove the action field from the updates
        delete updates.action;

        // Find the room by ID
        let room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

       

        switch (action) {
            case 'addUserToOwnerList':
                const { userIdToAddToOwnerList } = req.body;
                if (userIdToAddToOwnerList) {
                    if (!room.owner.includes(userIdToAddToOwnerList)) {
                        room.owner.push(userIdToAddToOwnerList);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to add to ban list is required' });
                }
                break;
            case 'removeUserFromOwnerList':
                const { userIdToRemoveFromOwnerList } = req.body;
                if (userIdToRemoveFromOwnerList) {
                    const index = room.owner.indexOf(userIdToRemoveFromOwnerList);
                    if (index !== -1) {
                        room.owner.splice(index, 1);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to remove from owner list is required' });
                }
                break;
            case 'addUserToBanList':
                const { userIdToAddToBanList } = req.body;
                if (userIdToAddToBanList) {
                    if (!room.banList.includes(userIdToAddToBanList)) {
                        room.banList.push(userIdToAddToBanList);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to add to ban list is required' });
                }
                break;
            case 'removeUserFromBanList':
                const { userIdToRemoveFromBanList } = req.body;
                if (userIdToRemoveFromBanList) {
                    const index = room.banList.indexOf(userIdToRemoveFromBanList);
                    if (index !== -1) {
                        room.banList.splice(index, 1);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to remove from ban list is required' });
                }
                break;
            case 'addUserToAdminList':
                const { userIdToAddToAdminList } = req.body;
                if (userIdToAddToAdminList) {
                    if (!room.admins.includes(userIdToAddToAdminList)) {
                        room.admins.push(userIdToAddToAdminList);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to add to admin list is required' });
                }
                break;
            case 'removeUserFromAdminList':
                const { userIdToRemoveFromAdminList } = req.body;
                if (userIdToRemoveFromAdminList) {
                    const index = room.admins.indexOf(userIdToRemoveFromAdminList);
                    if (index !== -1) {
                        room.admins.splice(index, 1);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to remove from admin list is required' });
                }
                break;
            case 'addUserToNoneList':
                const { userIdToAddToNoneList } = req.body;
                if (userIdToAddToNoneList) {
                    if (!room.none.includes(userIdToAddToNoneList)) {
                        room.none.push(userIdToAddToNoneList);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to add to none list is required' });
                }
                break;
            case 'removeUserFromNoneList':
                const { userIdToRemoveFromNoneList } = req.body;
                if (userIdToRemoveFromNoneList) {
                    const index = room.none.indexOf(userIdToRemoveFromNoneList);
                    if (index !== -1) {
                        room.none.splice(index, 1);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to remove from none list is required' });
                }
                break;
            case 'addUserToMemberList':
                const { userIdToAddToMemberList } = req.body;
                if (userIdToAddToMemberList) {
                    if (!room.members.includes(userIdToAddToMemberList)) {
                        room.members.push(userIdToAddToMemberList);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to add to member list is required' });
                }
                break;
            case 'removeUserFromMemberList':
                const { userIdToRemoveFromMemberList } = req.body;
                if (userIdToRemoveFromMemberList) {
                    const index = room.members.indexOf(userIdToRemoveFromMemberList);
                    if (index !== -1) {
                        room.members.splice(index, 1);
                    }
                } else {
                    return res.status(400).json({ error: 'User ID to remove from member list is required' });
                }
                break;
            case 'changePassword':
                const { newPassword } = req.body;
                if (newPassword) {
                    room.password = newPassword;
                } else {
                    return res.status(400).json({ error: 'New password is required' });
                }
                break;
            case 'deletePassword':
                room.password = undefined;
                break;
            default:
                break;
        }

        // Save the changes to the database
        room = await room.save();

        // Update the room with the specified changes
        const updatedRoom = await Room.findByIdAndUpdate(roomId, { $set: updates }, { new: true });

        res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.joinRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.body;

        let room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the user is already in the room
        if (room.users.includes(userId)) {
            return res.status(400).json({ error: 'User already in the room' });
        }

        // Add the user to the room's users array
        room.users.push(userId);

        // Set user role based on whether they are in the list of admins
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

     

        // Save the changes to the database
        room = await room.save();


        res.status(200).json({ message: 'User joined room successfully', room });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.leaveRoom = async (req, res) => {
    try {
        const { roomId, userId, username } = req.body;

        let room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the user is in the room
        const index = room.users.indexOf(userId);
        if (index === -1) {
            return res.status(400).json({ error: 'User is not in the room' });
        }

        // Remove the user from the room's users array
        room.users.splice(index, 1);

        // Save the changes to the database
        room = await room.save();


        res.status(200).json({ message: 'User left room successfully', room });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


