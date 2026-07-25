const pool = require('../config/db');

async function getWeeksByCourse(courseId) {
    const result = await pool.query(
        `SELECT id, course_id, week_number, title, is_active
         FROM weeks WHERE course_id = $1 AND is_active = true
         ORDER BY week_number ASC`,
        [courseId]
    );
    return result.rows;
}

module.exports = { getWeeksByCourse };