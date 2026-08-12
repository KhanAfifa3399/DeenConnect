const pool = require('../config/db');

async function createForUsers(userIds, { type, title, message, live_session_id }) {
    const uniqueIds = [...new Set(userIds)].filter(Boolean);
    if (uniqueIds.length === 0) return [];

    const valuePlaceholders = [];
    const params = [];
    uniqueIds.forEach((uid, i) => {
        const base = i * 5;
        valuePlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
        params.push(uid, type, title, message || null, live_session_id || null);
    });

    const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, live_session_id)
         VALUES ${valuePlaceholders.join(', ')}
         RETURNING id, user_id, type, title, message, live_session_id, created_at`,
        params
    );
    return result.rows;
}

async function getForUser(userId, limit = 30) {
    const result = await pool.query(
        `SELECT id, type, title, message, live_session_id, is_seen, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
}

async function getUnseenCount(userId) {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_seen = false`,
        [userId]
    );
    return result.rows[0].count;
}

async function markAllSeen(userId) {
    await pool.query(
        `UPDATE notifications SET is_seen = true WHERE user_id = $1 AND is_seen = false`,
        [userId]
    );
}

async function getAdminIds() {
    const result = await pool.query(`SELECT id FROM users WHERE role = 'admin' AND is_active = true`);
    return result.rows.map((r) => r.id);
}

async function existsForSessionAndType(live_session_id, type) {
    const result = await pool.query(
        `SELECT id FROM notifications WHERE live_session_id = $1 AND type = $2 LIMIT 1`,
        [live_session_id, type]
    );
    return result.rows.length > 0;
}

module.exports = { createForUsers, getForUser, getUnseenCount, markAllSeen, getAdminIds, existsForSessionAndType };