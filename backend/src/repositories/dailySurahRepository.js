const pool = require('../config/db');

async function getAll() {
    const result = await pool.query(
        'SELECT id, surah_number, surah_name, note, is_active FROM daily_surahs WHERE is_active = true ORDER BY surah_number ASC'
    );
    return result.rows;
}

async function create(surahNumber, surahName, note) {
    const result = await pool.query(
        `INSERT INTO daily_surahs (surah_number, surah_name, note)
         VALUES ($1, $2, $3) RETURNING id, surah_number, surah_name, note`,
        [surahNumber, surahName, note || null]
    );
    return result.rows[0];
}

async function deactivate(id) {
    const result = await pool.query(
        'UPDATE daily_surahs SET is_active = false WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { getAll, create, deactivate };