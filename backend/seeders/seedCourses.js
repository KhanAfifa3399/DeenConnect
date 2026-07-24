const { faker } = require('@faker-js/faker');
const pool = require('../src/config/db');
const courseRepository = require('../src/repositories/courseRepository');

const courseTitlesBySubject = {
    quran: ['Tajweed Fundamentals', 'Hifz Level 1', 'Hifz Level 2', 'Quran Recitation for Beginners', 'Advanced Tajweed Rules'],
    fiqh: ['Fiqh of Worship', 'Fiqh of Transactions', 'Introduction to Islamic Jurisprudence', 'Fiqh for Daily Life'],
    hadith: ['Introduction to Hadith Sciences', 'Study of Sahih Bukhari', 'Forty Hadith of An-Nawawi'],
};

function slugify(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function getAllSubjects() {
    const result = await pool.query('SELECT id, slug FROM subjects WHERE is_active = true');
    return result.rows;
}

async function getAllTeacherIds() {
    const result = await pool.query(`SELECT id FROM users WHERE role = 'teacher' AND is_active = true`);
    return result.rows.map(row => row.id);
}

async function seedCourses() {
    console.log('Seeding courses...');

    const subjects = await getAllSubjects();
    const teacherIds = await getAllTeacherIds();

    if (teacherIds.length === 0) {
        console.log('No teachers found — run seedUsers first. Skipping course seeding.');
        return;
    }

    let coursesCreated = 0;

    for (const subject of subjects) {
        const titles = courseTitlesBySubject[subject.slug] || [`${subject.slug} Fundamentals`, `Advanced ${subject.slug}`];

        for (const title of titles) {
            const randomTeacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];
            const durationMonths = faker.helpers.arrayElement([1, 2, 3, 4, 6]);
            const startDate = faker.date.soon({ days: 30 });
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + durationMonths);

            const slug = slugify(title) + '-' + faker.string.alphanumeric(4);

            try {
                await courseRepository.createCourse({
                    subject_id: subject.id,
                    teacher_id: randomTeacherId,
                    title,
                    slug,
                    description: faker.lorem.paragraph(),
                    duration_months: durationMonths,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    price: faker.helpers.arrayElement([0, 0, 0, 500, 1000]),
                });
                coursesCreated++;
            } catch (error) {
                console.log(`  Skipped "${title}" — ${error.message}`);
            }
        }
    }

    console.log(`${coursesCreated} courses seeded (with auto-generated weeks).`);
}

module.exports = { seedCourses };