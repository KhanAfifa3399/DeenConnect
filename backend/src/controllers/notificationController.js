const notificationRepository = require('../repositories/notificationRepository');

async function getMyNotifications(req, res) {
    try {
        const notifications = await notificationRepository.getForUser(req.user.userId);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
}

async function getUnseenCount(req, res) {
    try {
        const count = await notificationRepository.getUnseenCount(req.user.userId);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        console.error('Error fetching unseen count:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch unseen count' });
    }
}

async function markSeen(req, res) {
    try {
        await notificationRepository.markAllSeen(req.user.userId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error marking notifications seen:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
}

module.exports = { getMyNotifications, getUnseenCount, markSeen };