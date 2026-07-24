const pool = require('../config/db');

async function getAllSubjects() {
    const result = await pool.query(
        'SELECT id, name, slug, description, icon, is_active FROM subjects WHERE is_active = true ORDER BY name ASC'
    );
    return result.rows;
}

async function createSubject({ name, slug, description }) {
    const result = await pool.query(
        `INSERT INTO subjects (name, slug, description)
         VALUES ($1, $2, $3)
         RETURNING id, name, slug, description, icon, is_active, created_at`,
        [name, slug, description || null]
    );
    return result.rows[0];
}

async function getSubjectById(id) {
    const result = await pool.query(
        'SELECT id, name, slug, description, icon, is_active FROM subjects WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
}

async function updateSubject(id, { name, slug, description }) {
    const result = await pool.query(
        `UPDATE subjects
         SET name = $1, slug = $2, description = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, slug, description, icon, is_active, updated_at`,
        [name, slug, description || null, id]
    );
    return result.rows[0] || null;
}

async function deactivateSubject(id) {
    const result = await pool.query(
        `UPDATE subjects
         SET is_active = false, updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, is_active`,
        [id]
    );
    return result.rows[0] || null;
}

module.exports = { getAllSubjects, createSubject, getSubjectById, updateSubject, deactivateSubject };

// module.exports = { getAllSubjects, createSubject };