const pool = require('../config/db');

async function getAllCourses() {
    const result = await pool.query(
        `SELECT c.id, c.title, c.slug, c.description, c.thumbnail, c.duration_months, c.total_weeks,
                c.start_date, c.end_date, c.price, c.status, c.is_active,
                s.id AS subject_id, s.name AS subject_name,
                u.id AS teacher_id, u.full_name AS teacher_name
         FROM courses c
         JOIN subjects s ON c.subject_id = s.id
         JOIN users u ON c.teacher_id = u.id
         WHERE c.is_active = true
         ORDER BY c.created_at DESC`
    );
    return result.rows;
}

async function getCourseById(id) {
    const result = await pool.query(
        `SELECT c.id, c.title, c.slug, c.description, c.thumbnail, c.duration_months, c.total_weeks,
                c.start_date, c.end_date, c.price, c.status, c.is_active,
                s.id AS subject_id, s.name AS subject_name,
                u.id AS teacher_id, u.full_name AS teacher_name
         FROM courses c
         JOIN subjects s ON c.subject_id = s.id
         JOIN users u ON c.teacher_id = u.id
         WHERE c.id = $1`,
        [id]
    );
    return result.rows[0] || null;
}

async function isValidTeacher(teacherId) {
    const result = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND role = 'teacher' AND is_active = true`,
        [teacherId]
    );
    return result.rows.length > 0;
}

async function isValidSubject(subjectId) {
    const result = await pool.query(
        `SELECT id FROM subjects WHERE id = $1 AND is_active = true`,
        [subjectId]
    );
    return result.rows.length > 0;
}

async function createCourse({ subject_id, teacher_id, title, slug, description, duration_months, start_date, end_date, price }) {
    const total_weeks = duration_months * 4;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const courseResult = await client.query(
            `INSERT INTO courses (subject_id, teacher_id, title, slug, description, duration_months, total_weeks, start_date, end_date, price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, title, slug, duration_months, total_weeks, status, price`,
            [subject_id, teacher_id, title, slug, description || null, duration_months, total_weeks, start_date || null, end_date || null, price || 0]
        );

        const newCourse = courseResult.rows[0];

        for (let weekNumber = 1; weekNumber <= total_weeks; weekNumber++) {
            await client.query(
                `INSERT INTO weeks (course_id, week_number, title) VALUES ($1, $2, $3)`,
                [newCourse.id, weekNumber, `Week ${weekNumber}`]
            );
        }

        await client.query('COMMIT');
        return newCourse;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function updateCourse(id, { title, slug, description, duration_months, start_date, end_date, price, status }) {
    const total_weeks = duration_months * 4;
    const result = await pool.query(
        `UPDATE courses
         SET title = $1, slug = $2, description = $3, duration_months = $4, total_weeks = $5,
             start_date = $6, end_date = $7, price = $8, status = $9, updated_at = NOW()
         WHERE id = $10
         RETURNING id, title, slug, duration_months, total_weeks, status, price, updated_at`,
        [title, slug, description || null, duration_months, total_weeks, start_date || null, end_date || null, price || 0, status, id]
    );
    return result.rows[0] || null;
}

async function deactivateCourse(id) {
    const result = await pool.query(
        `UPDATE courses SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, title, is_active`,
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { getAllCourses, getCourseById, isValidTeacher, isValidSubject, createCourse, updateCourse, deactivateCourse };