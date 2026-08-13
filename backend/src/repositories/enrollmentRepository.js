const pool = require('../config/db');

async function enrollStudent(studentId, courseId, notes) {
    const result = await pool.query(
        `INSERT INTO enrollments (student_id, course_id, notes)
         VALUES ($1, $2, $3)
         RETURNING id, student_id, course_id, enrolled_at, status, progress_percentage, notes`,
        [studentId, courseId, notes || null]
    );
    return result.rows[0];
}

async function getStudentEnrollments(studentId) {
    const result = await pool.query(
        `SELECT e.id, e.status, e.progress_percentage, e.enrolled_at, e.completed_at,
                c.id AS course_id, c.title AS course_title, c.thumbnail, c.total_weeks
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = $1
         ORDER BY e.enrolled_at DESC`,
        [studentId]
    );
    return result.rows;
}

async function getCourseEnrollments(courseId) {
    const result = await pool.query(
        `SELECT e.id, e.status, e.progress_percentage, e.enrolled_at,
                u.id AS student_id, u.full_name AS student_name, u.email AS student_email
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         WHERE e.course_id = $1
         ORDER BY e.enrolled_at DESC`,
        [courseId]
    );
    return result.rows;
}

async function isAlreadyEnrolled(studentId, courseId) {
    const result = await pool.query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [studentId, courseId]
    );
    return result.rows.length > 0;
}

async function getStudentEnrollmentsWithProgress(studentId) {
    const result = await pool.query(
        `SELECT e.id AS enrollment_id, e.status AS enrollment_status, e.enrolled_at, e.completed_at,
                c.id AS course_id, c.title AS course_title, c.thumbnail, c.total_weeks,
                s.name AS subject_name, t.full_name AS teacher_name,
                COUNT(DISTINCT ls.id) FILTER (
                    WHERE ls.status != 'cancelled'
                      AND ls.scheduled_at + (COALESCE(ls.duration_minutes, 60) || ' minutes')::interval < NOW()
                ) AS sessions_held,
                COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('present', 'late')) AS sessions_attended
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         JOIN subjects s ON c.subject_id = s.id
         JOIN users t ON c.teacher_id = t.id
         LEFT JOIN weeks w ON w.course_id = c.id
         LEFT JOIN live_sessions ls ON ls.week_id = w.id
         LEFT JOIN attendance a ON a.live_session_id = ls.id AND a.student_id = e.student_id
         WHERE e.student_id = $1
         GROUP BY e.id, c.id, c.title, c.thumbnail, c.total_weeks, s.name, t.full_name
         ORDER BY e.enrolled_at DESC`,
        [studentId]
    );

    return result.rows.map((row) => ({
        ...row,
        sessions_held: Number(row.sessions_held),
        sessions_attended: Number(row.sessions_attended),
        computed_progress_percentage:
            row.sessions_held > 0 ? Math.round((row.sessions_attended / row.sessions_held) * 100) : 0,
    }));
}

module.exports = { enrollStudent, getStudentEnrollments, getCourseEnrollments, isAlreadyEnrolled, getStudentEnrollmentsWithProgress };