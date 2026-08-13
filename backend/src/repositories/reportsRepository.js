const pool = require('../config/db');

async function getEnrollmentsByStatus() {
    const result = await pool.query(
        `SELECT status, COUNT(*) AS count FROM enrollments GROUP BY status`
    );
    return result.rows;
}

async function getTopCoursesByEnrollment() {
    const result = await pool.query(
        `SELECT c.id, c.title, COUNT(e.id) AS enrollment_count
         FROM courses c
         LEFT JOIN enrollments e ON e.course_id = c.id
         WHERE c.is_active = true
         GROUP BY c.id, c.title
         ORDER BY enrollment_count DESC
         LIMIT 5`
    );
    return result.rows;
}

async function getAttendanceSummary() {
    const result = await pool.query(
        `SELECT status, COUNT(*) AS count FROM attendance GROUP BY status`
    );
    return result.rows;
}

async function getEnrollmentsOverTime() {
    const result = await pool.query(
        `SELECT TO_CHAR(enrolled_at, 'YYYY-MM') AS month, COUNT(*) AS count
         FROM enrollments
         GROUP BY month
         ORDER BY month ASC
         LIMIT 12`
    );
    return result.rows;
}

// Top-of-page KPI numbers, computed fresh on every call — no caching, no stored counters.
async function getKpiSummary() {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = true) AS total_students,
            (SELECT COUNT(*) FROM users WHERE role = 'teacher' AND is_active = true) AS total_teachers,
            (SELECT COUNT(*) FROM courses WHERE is_active = true) AS total_courses,
            (SELECT COUNT(*) FROM enrollments) AS total_enrollments,
            (SELECT COUNT(*) FROM enrollments WHERE status = 'active') AS active_enrollments,
            (SELECT COUNT(*) FROM attendance WHERE status IN ('present', 'late')) AS total_present,
            (SELECT COUNT(*) FROM attendance) AS total_attendance_marks
    `);
    const row = result.rows[0];
    const totalMarks = Number(row.total_attendance_marks);
    const totalPresent = Number(row.total_present);

    return {
        total_students: Number(row.total_students),
        total_teachers: Number(row.total_teachers),
        total_courses: Number(row.total_courses),
        total_enrollments: Number(row.total_enrollments),
        active_enrollments: Number(row.active_enrollments),
        overall_attendance_rate: totalMarks > 0 ? Math.round((totalPresent / totalMarks) * 100) : null,
    };
}

// Stats scoped to the current calendar month — recalculated fresh every call,
// so it always reflects "this month" as of right now, not a stored snapshot.
async function getMonthlyReport() {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM enrollments
                WHERE DATE_TRUNC('month', enrolled_at) = DATE_TRUNC('month', CURRENT_DATE)) AS new_enrollments_this_month,
            (SELECT COUNT(*) FROM live_sessions
                WHERE DATE_TRUNC('month', scheduled_at) = DATE_TRUNC('month', CURRENT_DATE)
                  AND status != 'cancelled') AS sessions_this_month,
            (SELECT COUNT(*) FROM attendance a JOIN live_sessions ls ON a.live_session_id = ls.id
                WHERE DATE_TRUNC('month', ls.scheduled_at) = DATE_TRUNC('month', CURRENT_DATE)
                  AND a.status IN ('present', 'late')) AS attended_this_month,
            (SELECT COUNT(*) FROM attendance a JOIN live_sessions ls ON a.live_session_id = ls.id
                WHERE DATE_TRUNC('month', ls.scheduled_at) = DATE_TRUNC('month', CURRENT_DATE)) AS marked_this_month
    `);
    const row = result.rows[0];
    const marked = Number(row.marked_this_month);
    const attended = Number(row.attended_this_month);

    return {
        month_label: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        new_enrollments: Number(row.new_enrollments_this_month),
        sessions_held: Number(row.sessions_this_month),
        attendance_rate: marked > 0 ? Math.round((attended / marked) * 100) : null,
    };
}

// A course counts as "completed" for a student when either:
//  (a) someone explicitly marked the enrollment status as 'completed', OR
//  (b) the course's own end_date has already passed while the enrollment is still 'active'
// (b) exists because nothing in the app currently sets status to 'completed' manually —
// this computes the real-world completion instead of depending on a flag nobody sets.
async function getCompletedCoursesReport() {
    const result = await pool.query(`
        SELECT u.full_name AS student_name, u.email AS student_email,
               c.title AS course_title, s.name AS subject_name, t.full_name AS teacher_name,
               e.enrolled_at, c.end_date,
               COALESCE(e.completed_at, c.end_date) AS completed_on
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN subjects s ON c.subject_id = s.id
        JOIN users t ON c.teacher_id = t.id
        JOIN users u ON e.student_id = u.id
        WHERE e.status = 'completed'
           OR (e.status = 'active' AND c.end_date IS NOT NULL AND c.end_date <= CURRENT_DATE)
        ORDER BY completed_on DESC
        LIMIT 50
    `);
    return result.rows;
}

module.exports = {
    getEnrollmentsByStatus,
    getTopCoursesByEnrollment,
    getAttendanceSummary,
    getEnrollmentsOverTime,
    getKpiSummary,
    getMonthlyReport,
    getCompletedCoursesReport,
};