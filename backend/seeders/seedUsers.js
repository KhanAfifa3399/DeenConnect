const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const pool = require('../src/config/db');

async function seedTeachers(count = 10) {
    console.log(`Seeding ${count} teachers...`);
    const hashedPassword = await bcrypt.hash('ustaz8788', 10);

    for (let i = 0; i < count; i++) {
        const fullName = `Ustadh ${faker.person.firstName()} ${faker.person.lastName()}`;
        const email = faker.internet.email({ firstName: `teacher${i}`, provider: 'deenconnect.com' }).toLowerCase();
        const phone = faker.phone.number({ style: 'national' });

        await pool.query(
            `INSERT INTO users (full_name, email, password, role, phone)
             VALUES ($1, $2, $3, 'teacher', $4)
             ON CONFLICT (email) DO NOTHING`,
            [fullName, email, hashedPassword, phone]
        );
    }
    console.log('Teachers seeded.');
}

async function seedStudents(count = 50) {
    console.log(`Seeding ${count} students...`);
    const hashedPassword = await bcrypt.hash('student8788', 10);

    for (let i = 0; i < count; i++) {
        const fullName = `${faker.person.firstName()} ${faker.person.lastName()}`;
        const email = faker.internet.email({ firstName: `student${i}`, provider: 'student.deenconnect.com' }).toLowerCase();
        const phone = faker.phone.number({ style: 'national' });

        await pool.query(
            `INSERT INTO users (full_name, email, password, role, phone)
             VALUES ($1, $2, $3, 'student', $4)
             ON CONFLICT (email) DO NOTHING`,
            [fullName, email, hashedPassword, phone]
        );
    }
    console.log('Students seeded.');
}

module.exports = { seedTeachers, seedStudents };