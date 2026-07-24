const pool = require('../config/db');

async function createLiveSession({ week_id, teacher_id, title, description, meeting_platform, meeting_link, scheduled_at, duration_minutes }) {
    const result = await pool.query(
        `INSERT INTO live_sessions (week_id, teacher_id, title, description, meeting_platform, meeting_link, scheduled_at, duration_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, week_id, title, meeting_platform, meeting_link, scheduled_at, duration_minutes, status`,
        [week_id, teacher_id, title, description || null, meeting_platform || null, meeting_link, scheduled_at, duration_minutes || null]
    );
    return result.rows[0];
}

async function getSessionsByWeek(weekId) {
    const result = await pool.query(
        `SELECT id, week_id, title, description, meeting_platform, meeting_link, scheduled_at, duration_minutes, status
         FROM live_sessions WHERE week_id = $1 AND is_active = true ORDER BY scheduled_at ASC`,
        [weekId]
    );
    return result.rows;
}

async function getUpcomingSessionsForStudent(studentId) {
    const result = await pool.query(
        `SELECT ls.id, ls.title, ls.meeting_platform, ls.meeting_link, ls.scheduled_at, ls.duration_minutes, ls.status,
                c.id AS course_id, c.title AS course_title,
                w.week_number
         FROM live_sessions ls
         JOIN weeks w ON ls.week_id = w.id
         JOIN courses c ON w.course_id = c.id
         JOIN enrollments e ON e.course_id = c.id
         WHERE e.student_id = $1
           AND ls.is_active = true
           AND ls.status IN ('scheduled', 'ongoing')
           AND ls.scheduled_at >= NOW() - INTERVAL '2 hours'
         ORDER BY ls.scheduled_at ASC`,
        [studentId]
    );
    return result.rows;
}

async function updateSessionStatus(id, status) {
    const result = await pool.query(
        `UPDATE live_sessions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, status`,
        [status, id]
    );
    return result.rows[0] || null;
}

async function deactivateSession(id) {
    const result = await pool.query(
        `UPDATE live_sessions SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, title, is_active`,
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { createLiveSession, getSessionsByWeek, getUpcomingSessionsForStudent, updateSessionStatus, deactivateSession };