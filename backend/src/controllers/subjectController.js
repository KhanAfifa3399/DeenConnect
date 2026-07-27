const subjectRepository = require('../repositories/subjectRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function getSubjects(req, res) {
    try {
        const subjects = await subjectRepository.getAllSubjects();
        res.status(200).json({
            success: true,
            data: subjects,
        });
    } catch (error) {
        console.error('Error fetching subjects:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects',
        });
    }
}

async function createSubject(req, res) {
    try {
        const { name, slug, description } = req.body;
        const newSubject = await subjectRepository.createSubject({ name, slug, description });
        res.status(201).json({
            success: true,
            data: newSubject,
        });

        await activityLogRepository.log(req.user.userId, 'Created subject', 'subject', newSubject.id, `Created subject: ${newSubject.name}`);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'A subject with this name or slug already exists',
            });
        }
        console.error('Error creating subject:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create subject',
        });
    }
}

async function getSubjectById(req, res) {
    try {
        const subject = await subjectRepository.getSubjectById(req.params.id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }
        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        console.error('Error fetching subject:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch subject' });
    }
}

async function updateSubject(req, res) {
    try {
        const { name, slug, description } = req.body;
        const updated = await subjectRepository.updateSubject(req.params.id, { name, slug, description });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'A subject with this name or slug already exists' });
        }
        console.error('Error updating subject:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update subject' });
    }
}

async function deleteSubject(req, res) {
    try {
        const deactivated = await subjectRepository.deactivateSubject(req.params.id);
        if (!deactivated) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.status(200).json({ success: true, message: 'Subject deactivated', data: deactivated });
    } catch (error) {
        console.error('Error deleting subject:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete subject' });
    }
}

module.exports = { getSubjects, createSubject, getSubjectById, updateSubject, deleteSubject };

// module.exports = { getSubjects, createSubject };