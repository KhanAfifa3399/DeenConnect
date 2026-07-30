const enrollmentRepository = require('../repositories/enrollmentRepository');
const courseRepository = require('../repositories/courseRepository');

async function enrollInCourse(req, res) {
    try {
        const studentId = req.user.userId;
        const { course_id, notes } = req.body;

        const course = await courseRepository.getCourseById(course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const alreadyEnrolled = await enrollmentRepository.isAlreadyEnrolled(studentId, course_id);
        if (alreadyEnrolled) {
            return res.status(409).json({ success: false, message: 'You are already enrolled in this course' });
        }

        const enrollment = await enrollmentRepository.enrollStudent(studentId, course_id, notes);
        res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
        console.error('Error enrolling in course:', error.message);
        res.status(500).json({ success: false, message: 'Failed to enroll in course' });
    }
}

async function getMyEnrollments(req, res) {
    try {
        const studentId = req.user.userId;
        const enrollments = await enrollmentRepository.getStudentEnrollments(studentId);
        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        console.error('Error fetching enrollments:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
    }
}

async function getCourseEnrollments(req, res) {
    try {
        const enrollments = await enrollmentRepository.getCourseEnrollments(req.params.courseId);
        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        console.error('Error fetching course enrollments:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch course enrollments' });
    }
}

module.exports = { enrollInCourse, getMyEnrollments, getCourseEnrollments };