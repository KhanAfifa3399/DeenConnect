const pool = require('../config/db');

async function getAllUsers() {
    const result = await pool.query(
        `SELECT id, full_name, email, role, phone, profile_picture, is_active, email_verified, created_at
         FROM users WHERE is_active = true ORDER BY created_at DESC`
    );
    return result.rows;
}

async function getUserById(id) {
    const result = await pool.query(
        `SELECT id, full_name, email, role, phone, profile_picture, is_active, email_verified, created_at
         FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0] || null;
}

async function getUserByEmail(email) {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
}

async function createUser({ full_name, email, hashedPassword, role, phone }) {
    const result = await pool.query(
        `INSERT INTO users (full_name, email, password, role, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, full_name, email, role, phone, is_active, email_verified, created_at`,
        [full_name, email, hashedPassword, role, phone || null]
    );
    return result.rows[0];
}

async function updateUser(id, { full_name, phone }) {
    const result = await pool.query(
        `UPDATE users
         SET full_name = $1, phone = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, full_name, email, role, phone, is_active, email_verified, updated_at`,
        [full_name, phone || null, id]
    );
    return result.rows[0] || null;
}

async function deactivateUser(id) {
    const result = await pool.query(
        `UPDATE users SET is_active = false, updated_at = NOW()
         WHERE id = $1
         RETURNING id, full_name, is_active`,
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { getAllUsers, getUserById, getUserByEmail, createUser, updateUser, deactivateUser };