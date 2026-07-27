const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');





async function getUsers(req, res) {
    try {
        const users = await userRepository.getAllUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
}

async function getUserById(req, res) {
    try {
        const user = await userRepository.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
}

async function createUser(req, res) {
    try {
        const { full_name, email, password, role, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userRepository.createUser({ full_name, email, hashedPassword, role, phone });
        await activityLogRepository.log(req.user.userId, 'Created user', 'user', newUser.id, `Created ${newUser.role} account: ${newUser.email}`);
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'A user with this email already exists' });
        }
        console.error('Error creating user:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
}

async function updateUser(req, res) {
    try {
        const { full_name, phone } = req.body;
        const updated = await userRepository.updateUser(req.params.id, { full_name, phone });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
}

async function deleteUser(req, res) {
    try {
        const deactivated = await userRepository.deactivateUser(req.params.id);
        if (!deactivated) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deactivated', data: deactivated });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await userRepository.getUserByEmail((await userRepository.getUserById(userId)).email);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRepository.updatePassword(userId, hashedPassword);

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
}

async function uploadPhoto(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }
        const photoUrl = `/uploads/avatars/${req.file.filename}`;
        const updated = await userRepository.updateProfilePicture(req.user.userId, photoUrl);
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error uploading photo:', error.message);
        res.status(500).json({ success: false, message: 'Failed to upload photo' });
    }
}

module.exports = { getUsers, getUserById, createUser, updateUser, changePassword, uploadPhoto, deleteUser };

