const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

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

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };