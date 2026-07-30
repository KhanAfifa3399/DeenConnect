const announcementRepository = require('../repositories/announcementRepository');

async function getAll(req, res) {
    try {
        const announcements = await announcementRepository.getAll();
        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
}

async function create(req, res) {
    try {
        const { title, message, audience, course_id } = req.body;
        const created_by = req.user.userId;
        const announcement = await announcementRepository.create({ title, message, audience, course_id, created_by });
        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        console.error('Error creating announcement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
}

async function remove(req, res) {
    try {
        const deleted = await announcementRepository.deactivate(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        console.error('Error removing announcement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to remove' });
    }
}

async function getForStudent(req, res) {
    try {
        const announcements = await announcementRepository.getForStudent(req.user.userId);
        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error('Error fetching student announcements:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
}

module.exports = { getAll, create, remove, getForStudent };
