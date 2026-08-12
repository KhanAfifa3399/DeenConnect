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
const weekRoutes = require('./routes/weekRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const quranContentRoutes = require('./routes/quranContentRoutes');
const dailySurahRoutes = require('./routes/dailySurahRoutes');
const duaRoutes = require('./routes/duaRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');



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
app.use('/api/weeks', weekRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/quran-content', quranContentRoutes);
app.use('/api/daily-surahs', dailySurahRoutes);
app.use('/api/duas', duaRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationRoutes);

module.exports = app;