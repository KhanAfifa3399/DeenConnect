const lectureRepository = require('../repositories/lectureRepository');

async function getLecturesByWeek(req, res) {
    try {
        const lectures = await lectureRepository.getLecturesByWeek(req.params.weekId);
        res.status(200).json({ success: true, data: lectures });
    } catch (error) {
        console.error('Error fetching lectures:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch lectures' });
    }
}

async function createLecture(req, res) {
    try {
        const { week_id, title, description, duration_minutes, lecture_order } = req.body;

        const validWeek = await lectureRepository.isValidWeek(week_id);
        if (!validWeek) {
            return res.status(400).json({ success: false, message: 'week_id does not belong to an active week' });
        }

        let video_url = null;
        if (req.file) {
            video_url = `/uploads/lectures/${req.file.filename}`;
        }

        const newLecture = await lectureRepository.createLecture({
            week_id, title, description, video_url, duration_minutes, lecture_order,
        });

        res.status(201).json({ success: true, data: newLecture });
    } catch (error) {
        console.error('Error creating lecture:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create lecture' });
    }
}

async function getMissingVideosForTeacher(req, res) {
    try {
        const teacherId = req.user.userId;
        const lectures = await lectureRepository.getMissingVideoLecturesForTeacher(teacherId);
        res.status(200).json({ success: true, data: lectures });
    } catch (error) {
        console.error('Error fetching missing video lectures:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch missing video lectures' });
    }
}

async function deleteLecture(req, res) {
    try {
        const deactivated = await lectureRepository.deactivateLecture(req.params.id);
        if (!deactivated) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }
        res.status(200).json({ success: true, message: 'Lecture deactivated', data: deactivated });
    } catch (error) {
        console.error('Error deleting lecture:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete lecture' });
    }
}

async function updateLecture(req, res) {
    try {
        const { title, description, lecture_order } = req.body;
        const updated = await lectureRepository.updateLecture(req.params.id, { title, description, lecture_order });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating lecture:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update lecture' });
    }
}

async function getMyMissingVideos(req, res) {
    try {
        const lectures = await lectureRepository.getMissingVideoLecturesForTeacher(req.user.userId);
        res.status(200).json({ success: true, data: lectures });
    } catch (error) {
        console.error('Error fetching missing-video lectures:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch lectures' });
    }
}
module.exports = { getLecturesByWeek, createLecture, updateLecture, deleteLecture, getMissingVideosForTeacher, getMyMissingVideos };
// module.exports = { getLecturesByWeek, createLecture, deleteLecture };