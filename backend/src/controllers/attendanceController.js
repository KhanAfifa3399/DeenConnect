const attendanceRepository = require('../repositories/attendanceRepository');

async function getSessionAttendance(req, res) {
    try {
        const sessionId = req.params.sessionId;
        const [attendance, enrolledStudents] = await Promise.all([
            attendanceRepository.getAttendanceForSession(sessionId),
            attendanceRepository.getEnrolledStudentsForSession(sessionId),
        ]);

        const attendanceMap = new Map(attendance.map((a) => [a.student_id, a]));
        const merged = enrolledStudents.map((student) => {
            const record = attendanceMap.get(student.id);
            return {
                student_id: student.id,
                student_name: student.full_name,
                status: record?.status || 'not_marked',
                notes: record?.notes || null,
                marked_at: record?.marked_at || null,
            };
        });

        res.status(200).json({ success: true, data: merged });
    } catch (error) {
        console.error('Error fetching attendance:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
}

async function markAttendance(req, res) {
    try {
        const { live_session_id, student_id, status, notes } = req.body;
        const record = await attendanceRepository.markAttendance(live_session_id, student_id, status, notes);
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error('Error marking attendance:', error.message);
        res.status(500).json({ success: false, message: 'Failed to mark attendance' });
    }
}

module.exports = { getSessionAttendance, markAttendance };