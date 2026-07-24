const courseRepository = require('../repositories/courseRepository');

async function getCourses(req, res) {
    try {
        const courses = await courseRepository.getAllCourses();
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        console.error('Error fetching courses:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
}

async function getCourseById(req, res) {
    try {
        const course = await courseRepository.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('Error fetching course:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch course' });
    }
}

async function createCourse(req, res) {
    try {
        const { subject_id, teacher_id, title, slug, description, duration_months, start_date, end_date, price } = req.body;

        const validTeacher = await courseRepository.isValidTeacher(teacher_id);
        if (!validTeacher) {
            return res.status(400).json({ success: false, message: 'teacher_id does not belong to an active teacher' });
        }

        const validSubject = await courseRepository.isValidSubject(subject_id);
        if (!validSubject) {
            return res.status(400).json({ success: false, message: 'subject_id does not belong to an active subject' });
        }

        const newCourse = await courseRepository.createCourse({
            subject_id, teacher_id, title, slug, description, duration_months, start_date, end_date, price,
        });

        res.status(201).json({ success: true, data: newCourse });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'A course with this slug already exists' });
        }
        console.error('Error creating course:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create course' });
    }
}

async function updateCourse(req, res) {
    try {
        const { title, slug, description, duration_months, start_date, end_date, price, status } = req.body;
        const updated = await courseRepository.updateCourse(req.params.id, { title, slug, description, duration_months, start_date, end_date, price, status });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating course:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update course' });
    }
}

async function deleteCourse(req, res) {
    try {
        const deactivated = await courseRepository.deactivateCourse(req.params.id);
        if (!deactivated) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.status(200).json({ success: true, message: 'Course deactivated', data: deactivated });
    } catch (error) {
        console.error('Error deleting course:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
}

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse };