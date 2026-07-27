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

module.exports = { getEnrollmentsByStatus, getTopCoursesByEnrollment, getAttendanceSummary, getEnrollmentsOverTime };