const dailySurahRepository = require('../repositories/dailySurahRepository');

async function getAll(req, res) {
    try {
        const surahs = await dailySurahRepository.getAll();
        res.status(200).json({ success: true, data: surahs });
    } catch (error) {
        console.error('Error fetching daily surahs:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch daily surahs' });
    }
}

async function create(req, res) {
    try {
        const { surah_number, surah_name, note } = req.body;
        const surah = await dailySurahRepository.create(Number(surah_number), surah_name, note);
        res.status(201).json({ success: true, data: surah });
    } catch (error) {
        console.error('Error creating daily surah:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add daily surah' });
    }
}

async function remove(req, res) {
    try {
        const deleted = await dailySurahRepository.deactivate(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        console.error('Error removing daily surah:', error.message);
        res.status(500).json({ success: false, message: 'Failed to remove' });
    }
}

module.exports = { getAll, create, remove };