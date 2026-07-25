const pool = require('../config/db');

async function getAttendanceForSession(liveSessionId) {
    const result = await pool.query(
        `SELECT a.id, a.status, a.marked_at, a.notes,
                u.id AS student_id, u.full_name AS student_name
         FROM attendance a
         JOIN users u ON a.student_id = u.id
         WHERE a.live_session_id = $1
         ORDER BY u.full_name ASC`,
        [liveSessionId]
    );
    return result.rows;
}

async function getEnrolledStudentsForSession(liveSessionId) {
    const result = await pool.query(
        `SELECT DISTINCT u.id, u.full_name
         FROM live_sessions ls
         JOIN weeks w ON ls.week_id = w.id
         JOIN courses c ON w.course_id = c.id
         JOIN enrollments e ON e.course_id = c.id
         JOIN users u ON e.student_id = u.id
         WHERE ls.id = $1
         ORDER BY u.full_name ASC`,
        [liveSessionId]
    );
    return result.rows;
}

async function markAttendance(liveSessionId, studentId, status, notes) {
    const result = await pool.query(
        `INSERT INTO attendance (live_session_id, student_id, status, notes, marked_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (live_session_id, student_id)
         DO UPDATE SET status = $3, notes = $4, marked_at = NOW()
         RETURNING id, status, marked_at, notes`,
        [liveSessionId, studentId, status, notes || null]
    );
    return result.rows[0];
}

module.exports = { getAttendanceForSession, getEnrolledStudentsForSession, markAttendance };