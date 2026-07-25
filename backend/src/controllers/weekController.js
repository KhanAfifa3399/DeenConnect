const weekRepository = require('../repositories/weekRepository');

async function getWeeksByCourse(req, res) {
    try {
        const weeks = await weekRepository.getWeeksByCourse(req.params.courseId);
        res.status(200).json({ success: true, data: weeks });
    } catch (error) {
        console.error('Error fetching weeks:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weeks' });
    }
}

module.exports = { getWeeksByCourse };