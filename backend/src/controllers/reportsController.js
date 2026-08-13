const reportsRepository = require('../repositories/reportsRepository');

async function getSummary(req, res) {
    try {
        const [
            enrollmentsByStatus,
            topCourses,
            attendanceSummary,
            enrollmentsOverTime,
            kpiSummary,
            monthlyReport,
            completedCourses,
        ] = await Promise.all([
            reportsRepository.getEnrollmentsByStatus(),
            reportsRepository.getTopCoursesByEnrollment(),
            reportsRepository.getAttendanceSummary(),
            reportsRepository.getEnrollmentsOverTime(),
            reportsRepository.getKpiSummary(),
            reportsRepository.getMonthlyReport(),
            reportsRepository.getCompletedCoursesReport(),
        ]);

        res.status(200).json({
            success: true,
            data: {
                enrollmentsByStatus,
                topCourses,
                attendanceSummary,
                enrollmentsOverTime,
                kpiSummary,
                monthlyReport,
                completedCourses,
            },
        });
    } catch (error) {
        console.error('Error generating report summary:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
}

module.exports = { getSummary };