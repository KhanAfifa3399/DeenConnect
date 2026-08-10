const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'This account has been deactivated' });
        }

        if (user.role === 'teacher' && user.approval_status === 'pending') {
            return res.status(403).json({ success: false, message: 'Your account is awaiting Admin approval. Please check back soon.' });
        }

        if (user.role === 'teacher' && user.approval_status === 'rejected') {
            return res.status(403).json({ success: false, message: 'Your teacher application was not approved. Please contact the Admin.' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
}
async function register(req, res) {
    try {
        const { full_name, email, password, phone } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userRepository.createUser({
            full_name,
            email,
            hashedPassword,
            role: 'student',
            phone,
        });

        const token = jwt.sign(
            { userId: newUser.id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            data: {
                token,
                user: newUser,
            },
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }
        console.error('Error during registration:', error.message);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
}

async function registerTeacher(req, res) {
    try {
        const { full_name, email, password, phone } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeacher = await userRepository.createPendingTeacher({ full_name, email, hashedPassword, phone });

        res.status(201).json({
            success: true,
            message: 'Registration submitted. Your account will be reviewed by an Admin before you can log in.',
            data: newTeacher,
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }
        console.error('Error during teacher registration:', error.message);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
}

module.exports = { login, register, registerTeacher };

