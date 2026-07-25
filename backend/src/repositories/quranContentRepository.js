const pool = require('../config/db');

async function getAllByType(type) {
    const result = await pool.query(
        'SELECT id, type, number, name, pdf_url, is_active FROM quran_content WHERE type = $1 AND is_active = true ORDER BY number ASC',
        [type]
    );
    return result.rows;
}

async function upsertContent(type, number, name, pdfUrl) {
    const result = await pool.query(
        `INSERT INTO quran_content (type, number, name, pdf_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (type, number)
         DO UPDATE SET name = $3, pdf_url = $4, updated_at = NOW()
         RETURNING id, type, number, name, pdf_url`,
        [type, number, name, pdfUrl]
    );
    return result.rows[0];
}

async function deactivate(id) {
    const result = await pool.query(
        'UPDATE quran_content SET is_active = false WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { getAllByType, upsertContent, deactivate };