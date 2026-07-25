const quranContentRepository = require('../repositories/quranContentRepository');

async function getByType(req, res) {
    try {
        const { type } = req.params;
        const content = await quranContentRepository.getAllByType(type);
        res.status(200).json({ success: true, data: content });
    } catch (error) {
        console.error('Error fetching Quran content:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
}

async function upload(req, res) {
    try {
        const { type, number, name } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'PDF file is required' });
        }
        const pdfUrl = `/uploads/quran-pdfs/${req.file.filename}`;
        const content = await quranContentRepository.upsertContent(type, Number(number), name, pdfUrl);
        res.status(201).json({ success: true, data: content });
    } catch (error) {
        console.error('Error uploading Quran content:', error.message);
        res.status(500).json({ success: false, message: 'Failed to upload content' });
    }
}

async function remove(req, res) {
    try {
        const deleted = await quranContentRepository.deactivate(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        console.error('Error removing Quran content:', error.message);
        res.status(500).json({ success: false, message: 'Failed to remove content' });
    }
}

module.exports = { getByType, upload, remove };