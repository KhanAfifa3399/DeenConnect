const pool = require('../config/db');

async function getAll() {
    const result = await pool.query(
        `SELECT id, title, arabic_text, transliteration, translation, reference, category, is_active
         FROM daily_duas WHERE is_active = true ORDER BY created_at DESC`
    );
    return result.rows;
}

async function create({ title, arabic_text, transliteration, translation, reference, category }) {
    const result = await pool.query(
        `INSERT INTO daily_duas (title, arabic_text, transliteration, translation, reference, category)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, arabic_text, transliteration || null, translation, reference || null, category || null]
    );
    return result.rows[0];
}

async function update(id, { title, arabic_text, transliteration, translation, reference, category }) {
    const result = await pool.query(
        `UPDATE daily_duas
         SET title = $1, arabic_text = $2, transliteration = $3, translation = $4, reference = $5, category = $6, updated_at = NOW()
         WHERE id = $7 RETURNING *`,
        [title, arabic_text, transliteration || null, translation, reference || null, category || null, id]
    );
    return result.rows[0] || null;
}

async function deactivate(id) {
    const result = await pool.query(
        'UPDATE daily_duas SET is_active = false WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { getAll, create, update, deactivate };