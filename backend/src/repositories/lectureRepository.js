const pool = require('../config/db');

async function getLecturesByWeek(weekId) {
    const result = await pool.query(
        `SELECT id, week_id, title, description, video_url, duration_minutes, lecture_order, is_active
         FROM lectures WHERE week_id = $1 AND is_active = true ORDER BY lecture_order ASC`,
        [weekId]
    );
    return result.rows;
}

async function getLectureById(id) {
    const result = await pool.query(
        `SELECT id, week_id, title, description, video_url, duration_minutes, lecture_order, is_active
         FROM lectures WHERE id = $1`,
        [id]
    );
    return result.rows[0] || null;
}

async function isValidWeek(weekId) {
    const result = await pool.query('SELECT id FROM weeks WHERE id = $1 AND is_active = true', [weekId]);
    return result.rows.length > 0;
}

async function createLecture({ week_id, title, description, video_url, duration_minutes, lecture_order }) {
    const result = await pool.query(
        `INSERT INTO lectures (week_id, title, description, video_url, duration_minutes, lecture_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, week_id, title, description, video_url, duration_minutes, lecture_order`,
        [week_id, title, description || null, video_url || null, duration_minutes || null, lecture_order || 1]
    );
    return result.rows[0];
}

async function deactivateLecture(id) {
    const result = await pool.query(
        `UPDATE lectures SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, title, is_active`,
        [id]
    );
    return result.rows[0] || null;
}

async function updateLecture(id, { title, description, lecture_order }) {
    const result = await pool.query(
        `UPDATE lectures
         SET title = $1, description = $2, lecture_order = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, week_id, title, description, video_url, duration_minutes, lecture_order`,
        [title, description || null, lecture_order, id]
    );
    return result.rows[0] || null;
}



async function getMissingVideoLecturesForTeacher(teacherId) {
    const result = await pool.query(
        `SELECT l.id, l.title, l.week_id, w.title AS week_title, c.id AS course_id, c.title AS course_title
         FROM lectures l
         JOIN weeks w ON l.week_id = w.id
         JOIN courses c ON w.course_id = c.id
         WHERE c.teacher_id = $1
           AND l.is_active = true
           AND l.video_url IS NULL
         ORDER BY l.created_at DESC
         LIMIT 20`,
        [teacherId]
    );
    return result.rows;
}

module.exports = { getLecturesByWeek, getLectureById, isValidWeek, createLecture, updateLecture, deactivateLecture, getMissingVideoLecturesForTeacher };