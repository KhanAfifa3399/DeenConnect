const { seedTeachers, seedStudents } = require('./seedUsers');
const { seedCourses } = require('./seedCourses');
const { seedLectures } = require('./seedLectures');
const { seedEnrollments } = require('./seedEnrollments');
const pool = require('../src/config/db');

async function runAllSeeders() {
    try {
        console.log('--- Starting database seeding ---');
        await seedTeachers(10);
        await seedStudents(50);
        await seedCourses();
        await seedLectures();
        await seedEnrollments();
        console.log('--- Seeding complete ---');
    } catch (error) {
        console.error('Seeding failed:', error.message);
    } finally {
        await pool.end();
    }
}

runAllSeeders();