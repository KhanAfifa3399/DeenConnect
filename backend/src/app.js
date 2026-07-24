const express = require('express');
const cors = require('cors');
const path = require('path');
const subjectRoutes = require('./routes/subjectRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const liveSessionRoutes = require('./routes/liveSessionRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'DeenConnect API is running' });
});

app.use('/api/subjects', subjectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/live-sessions', liveSessionRoutes);

module.exports = app;