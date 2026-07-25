const duaRepository = require('../repositories/duaRepository');

async function getAll(req, res) {
    try {
        const duas = await duaRepository.getAll();
        res.status(200).json({ success: true, data: duas });
    } catch (error) {
        console.error('Error fetching duas:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch duas' });
    }
}

async function create(req, res) {
    try {
        const dua = await duaRepository.create(req.body);
        res.status(201).json({ success: true, data: dua });
    } catch (error) {
        console.error('Error creating dua:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create dua' });
    }
}

async function update(req, res) {
    try {
        const dua = await duaRepository.update(req.params.id, req.body);
        if (!dua) {
            return res.status(404).json({ success: false, message: 'Dua not found' });
        }
        res.status(200).json({ success: true, data: dua });
    } catch (error) {
        console.error('Error updating dua:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update dua' });
    }
}

async function remove(req, res) {
    try {
        const deleted = await duaRepository.deactivate(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Dua not found' });
        }
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        console.error('Error removing dua:', error.message);
        res.status(500).json({ success: false, message: 'Failed to remove' });
    }
}

module.exports = { getAll, create, update, remove };