const pool = require('../config/db');

async function getAll() {
    const result = await pool.query(
        `SELECT a.id, a.title, a.message, a.audience, a.created_at,
                a.course_id, c.title AS course_title,
                u.full_name AS created_by_name
         FROM announcements a
         LEFT JOIN courses c ON a.course_id = c.id
         JOIN users u ON a.created_by = u.id
         WHERE a.is_active = true
         ORDER BY a.created_at DESC`
    );
    return result.rows;
}

async function create({ title, message, audience, course_id, created_by }) {
    const result = await pool.query(
        `INSERT INTO announcements (title, message, audience, course_id, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, title, message, audience, course_id, created_at`,
        [title, message, audience, course_id || null, created_by]
    );
    return result.rows[0];
}

async function deactivate(id) {
    const result = await pool.query(
        'UPDATE announcements SET is_active = false WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { getAll, create, deactivate };