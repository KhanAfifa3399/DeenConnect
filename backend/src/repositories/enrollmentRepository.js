const pool = require('../config/db');

async function enrollStudent(studentId, courseId) {
    const result = await pool.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES ($1, $2)
         RETURNING id, student_id, course_id, enrolled_at, status, progress_percentage`,
        [studentId, courseId]
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

module.exports = { enrollStudent, getStudentEnrollments, getCourseEnrollments, isAlreadyEnrolled };