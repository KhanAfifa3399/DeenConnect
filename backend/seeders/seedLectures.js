const { faker } = require('@faker-js/faker');
const pool = require('../src/config/db');

const lectureTopics = [
    'Introduction and Overview', 'Core Concepts Explained', 'Practical Examples',
    'Common Mistakes to Avoid', 'Q&A and Review', 'Deep Dive', 'Case Studies', 'Summary and Next Steps',
];

async function getAllWeeks() {
    const result = await pool.query('SELECT id, week_number FROM weeks WHERE is_active = true');
    return result.rows;
}

async function seedLectures() {
    console.log('Seeding lectures...');

    const weeks = await getAllWeeks();
    let lecturesCreated = 0;

    for (const week of weeks) {
        const lectureCount = faker.helpers.arrayElement([2, 3]);

        for (let order = 1; order <= lectureCount; order++) {
            const title = `${faker.helpers.arrayElement(lectureTopics)} (Lecture ${order})`;

            await pool.query(
                `INSERT INTO lectures (week_id, title, description, video_url, duration_minutes, lecture_order)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    week.id,
                    title,
                    faker.lorem.sentences(2),
                    null,
                    faker.number.int({ min: 15, max: 60 }),
                    order,
                ]
            );
            lecturesCreated++;
        }
    }

    console.log(`${lecturesCreated} lectures seeded.`);
}

module.exports = { seedLectures };