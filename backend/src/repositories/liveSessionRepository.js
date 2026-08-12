const pool = require('../config/db');

// Shared SQL snippet: computes the REAL, live-calculated state of a session
// by comparing NOW() to scheduled_at and scheduled_at + duration_minutes.
// This never goes stale because it's recalculated on every single query.
const COMPUTED_STATUS_SQL = `
    CASE
        WHEN status = 'cancelled' THEN 'cancelled'
        WHEN NOW() < scheduled_at THEN 'upcoming'
        WHEN NOW() >= scheduled_at
             AND NOW() < scheduled_at + (COALESCE(duration_minutes, 60) || ' minutes')::interval
            THEN 'live'
        ELSE 'ended'
    END
`;

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
        `SELECT id, week_id, title, description, meeting_platform, meeting_link, scheduled_at, duration_minutes, status,
                ${COMPUTED_STATUS_SQL} AS computed_status
         FROM live_sessions WHERE week_id = $1 AND is_active = true ORDER BY scheduled_at ASC`,
        [weekId]
    );
    return result.rows;
}

async function getUpcomingSessionsForStudent(studentId) {
    const result = await pool.query(
        `SELECT ls.id, ls.title, ls.meeting_platform, ls.meeting_link, ls.scheduled_at, ls.duration_minutes, ls.status,
                ${COMPUTED_STATUS_SQL.replace(/\bstatus\b/g, 'ls.status').replace(/scheduled_at/g, 'ls.scheduled_at').replace(/duration_minutes/g, 'ls.duration_minutes')} AS computed_status,
                c.id AS course_id, c.title AS course_title,
                w.id AS week_id, w.week_number
         FROM live_sessions ls
         JOIN weeks w ON ls.week_id = w.id
         JOIN courses c ON w.course_id = c.id
         JOIN enrollments e ON e.course_id = c.id
         WHERE e.student_id = $1
           AND ls.is_active = true
           AND ls.status != 'cancelled'
           AND ls.scheduled_at + (COALESCE(ls.duration_minutes, 60) || ' minutes')::interval >= NOW()
         ORDER BY ls.scheduled_at ASC`,
        [studentId]
    );
    return result.rows;
}

async function getUpcomingSessionsForTeacher(teacherId) {
    const result = await pool.query(
        `SELECT ls.id, ls.title, ls.meeting_platform, ls.meeting_link, ls.scheduled_at, ls.duration_minutes, ls.status,
                ${COMPUTED_STATUS_SQL.replace(/\bstatus\b/g, 'ls.status').replace(/scheduled_at/g, 'ls.scheduled_at').replace(/duration_minutes/g, 'ls.duration_minutes')} AS computed_status,
                c.id AS course_id, c.title AS course_title,
                w.id AS week_id, w.week_number
         FROM live_sessions ls
         JOIN weeks w ON ls.week_id = w.id
         JOIN courses c ON w.course_id = c.id
         WHERE c.teacher_id = $1
           AND ls.is_active = true
           AND ls.status != 'cancelled'
           AND ls.scheduled_at + (COALESCE(ls.duration_minutes, 60) || ' minutes')::interval >= NOW()
         ORDER BY ls.scheduled_at ASC
         LIMIT 10`,
        [teacherId]
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

async function getCourseInfoForWeek(weekId) {
    const result = await pool.query(
        `SELECT c.id AS course_id, c.title AS course_title, c.teacher_id
         FROM weeks w
         JOIN courses c ON w.course_id = c.id
         WHERE w.id = $1`,
        [weekId]
    );
    return result.rows[0] || null;
}

module.exports = { createLiveSession, getSessionsByWeek, getUpcomingSessionsForStudent, getUpcomingSessionsForTeacher, updateSessionStatus, deactivateSession, getCourseInfoForWeek };