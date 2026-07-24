const { faker } = require('@faker-js/faker');
const pool = require('../src/config/db');

async function getAllStudentIds() {
    const result = await pool.query(`SELECT id FROM users WHERE role = 'student' AND is_active = true`);
    return result.rows.map(row => row.id);
}

async function getAllCourseIds() {
    const result = await pool.query(`SELECT id FROM courses WHERE is_active = true`);
    return result.rows.map(row => row.id);
}

async function seedEnrollments() {
    console.log('Seeding enrollments...');

    const studentIds = await getAllStudentIds();
    const courseIds = await getAllCourseIds();

    if (studentIds.length === 0 || courseIds.length === 0) {
        console.log('No students or courses found — skipping enrollment seeding.');
        return;
    }

    let enrollmentsCreated = 0;

    for (const studentId of studentIds) {
        const numberOfCourses = faker.number.int({ min: 1, max: 4 });
        const shuffledCourses = faker.helpers.shuffle([...courseIds]);
        const coursesToEnroll = shuffledCourses.slice(0, numberOfCourses);

        for (const courseId of coursesToEnroll) {
            const status = faker.helpers.weightedArrayElement([
                { weight: 7, value: 'active' },
                { weight: 2, value: 'completed' },
                { weight: 1, value: 'dropped' },
            ]);
            const progress = status === 'completed' ? 100 : faker.number.int({ min: 0, max: 90 });

            await pool.query(
                `INSERT INTO enrollments (student_id, course_id, status, progress_percentage, completed_at)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (student_id, course_id) DO NOTHING`,
                [studentId, courseId, status, progress, status === 'completed' ? faker.date.recent() : null]
            );
            enrollmentsCreated++;
        }
    }

    console.log(`Up to ${enrollmentsCreated} enrollments seeded (duplicates skipped automatically).`);
}

module.exports = { seedEnrollments };