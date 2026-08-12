const liveSessionRepository = require('../repositories/liveSessionRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const notificationRepository = require('../repositories/notificationRepository');

async function notifyOnSessionCreated(session, weekId, creatorRole) {
    try {
        const courseInfo = await liveSessionRepository.getCourseInfoForWeek(weekId);
        if (!courseInfo) return;

        const enrollments = await enrollmentRepository.getCourseEnrollments(courseInfo.course_id);
        const studentIds = enrollments.map((e) => e.student_id);

        let recipientIds = [...studentIds];
        let creatorLabel;

        if (creatorRole === 'teacher') {
            const adminIds = await notificationRepository.getAdminIds();
            recipientIds = [...recipientIds, ...adminIds];
            creatorLabel = 'your teacher';
        } else {
            recipientIds = [...recipientIds, courseInfo.teacher_id];
            creatorLabel = 'the admin';
        }

        if (recipientIds.length === 0) return;

        await notificationRepository.createForUsers(recipientIds, {
            type: 'live_session_scheduled',
            title: 'New Live Session Scheduled',
            message: `A new live session "${session.title}" has been scheduled for "${courseInfo.course_title}" by ${creatorLabel}.`,
            live_session_id: session.id,
        });
    } catch (notifyErr) {
        // Notification failure should never block session creation from succeeding
        console.error('Failed to send session-created notifications:', notifyErr.message);
    }
}

async function createSession(req, res) {
    try {
        const { week_id, title, description, meeting_platform, meeting_link, scheduled_at, duration_minutes } = req.body;
        const teacher_id = req.user.userId;

        const session = await liveSessionRepository.createLiveSession({
            week_id, teacher_id, title, description, meeting_platform, meeting_link, scheduled_at, duration_minutes,
        });

        await notifyOnSessionCreated(session, week_id, req.user.role);

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        console.error('Error creating live session:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create live session' });
    }
}

async function getSessionsByWeek(req, res) {
    try {
        const sessions = await liveSessionRepository.getSessionsByWeek(req.params.weekId);
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching sessions:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
    }
}

async function getMyUpcomingSessions(req, res) {
    try {
        const studentId = req.user.userId;
        const sessions = await liveSessionRepository.getUpcomingSessionsForStudent(studentId);
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching upcoming sessions:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming sessions' });
    }
}

async function getMyUpcomingSessionsForTeacher(req, res) {
    try {
        const teacherId = req.user.userId;
        const sessions = await liveSessionRepository.getUpcomingSessionsForTeacher(teacherId);
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching teacher upcoming sessions:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming sessions' });
    }
}

async function updateStatus(req, res) {
    try {
        const { status } = req.body;
        const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        const updated = await liveSessionRepository.updateSessionStatus(req.params.id, status);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating session status:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update session status' });
    }
}

async function deleteSession(req, res) {
    try {
        const deactivated = await liveSessionRepository.deactivateSession(req.params.id);
        if (!deactivated) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, message: 'Session deactivated', data: deactivated });
    } catch (error) {
        console.error('Error deleting session:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete session' });
    }
}

async function getMyUpcomingAsTeacher(req, res) {
    try {
        const sessions = await liveSessionRepository.getUpcomingSessionsForTeacher(req.user.userId);
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching teacher upcoming sessions:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming sessions' });
    }
}

module.exports = { createSession, getSessionsByWeek, getMyUpcomingSessions, getMyUpcomingSessionsForTeacher, getMyUpcomingAsTeacher, updateStatus, deleteSession };