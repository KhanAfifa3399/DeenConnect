const activityLogRepository = require('../repositories/activityLogRepository');

async function getRecent(req, res) {
    try {
        const logs = await activityLogRepository.getRecent(100);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching activity logs:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
    }
}

async function getNotifications(req, res) {
    try {
        const logs = await activityLogRepository.getRecentExcludingUser(req.user.userId, 20);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
}

module.exports = { getRecent, getNotifications };

