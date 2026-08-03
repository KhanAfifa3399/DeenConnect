const pool = require('../config/db');

async function log(userId, action, entityType, entityId, details) {
    try {
        await pool.query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId || null, action, entityType || null, entityId || null, details || null]
        );
    } catch (error) {
        console.error('Failed to write activity log:', error.message);
    }
}

async function getRecent(limit = 100) {
    const result = await pool.query(
        `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details, al.created_at,
                u.full_name AS user_name, u.role AS user_role
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.id
         ORDER BY al.created_at DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
}

async function getRecentExcludingUser(excludeUserId, limit = 100) {
    const result = await pool.query(
        `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details, al.created_at,
                u.full_name AS user_name, u.role AS user_role
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.id
         WHERE al.user_id != $1 OR al.user_id IS NULL
         ORDER BY al.created_at DESC
         LIMIT $2`,
        [excludeUserId, limit]
    );
    return result.rows;
}

module.exports = { log, getRecent, getRecentExcludingUser };
// module.exports = { log, getRecent };