const announcementRepository = require('../repositories/announcementRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

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

        try {
            await activityLogRepository.log(req.user.userId, 'Posted announcement', 'announcement', announcement.id, `"${announcement.title}" (${audience})`);
        } catch (logError) {
            console.error('Failed to write activity log (non-fatal):', logError.message);
        }

        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        console.error('Error creating announcement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
}

async function update(req, res) {
    try {
        const existing = await announcementRepository.getById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        if (req.user.role !== 'admin' && existing.created_by !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'You can only edit your own announcements' });
        }

        const { title, message, audience, course_id } = req.body;
        const updated = await announcementRepository.update(req.params.id, { title, message, audience, course_id });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating announcement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update announcement' });
    }
}

async function remove(req, res) {
    try {
        const existing = await announcementRepository.getById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        if (req.user.role !== 'admin' && existing.created_by !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'You can only delete your own announcements' });
        }

        await announcementRepository.deactivate(req.params.id);
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

async function getForTeacher(req, res) {
    try {
        const announcements = await announcementRepository.getForTeacher(req.user.userId);
        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error('Error fetching teacher announcements:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
}

async function getMine(req, res) {
    try {
        const announcements = await announcementRepository.getCreatedByUser(req.user.userId);
        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error('Error fetching your announcements:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch your announcements' });
    }
}

module.exports = { getAll, create, update, remove, getForStudent, getForTeacher, getMine };