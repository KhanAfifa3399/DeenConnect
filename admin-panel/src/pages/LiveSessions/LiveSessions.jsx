import { useState, useEffect } from 'react';
import { FiPlus, FiVideo, FiClock, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import { getAllCourses } from '../../api/coursesApi';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getSessionsByWeek, updateSessionStatus, deleteLiveSession } from '../../api/liveSessionsApi';
import ScheduleSessionModal from './ScheduleSessionModal';
import styles from '../Subjects/Subjects.module.css';
import liveStyles from './LiveSessions.module.css';
import { formatWallClockDate, formatWallClockTime } from '../../utils/formatDateTime';


function LiveSessions() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getAllCourses().then(setCourses).catch(console.error);
  }, []);

  async function loadSessionsForCourse(cId) {
    if (!cId) {
      setSessions([]);
      return;
    }
    setLoadingSessions(true);
    try {
      const weeksData = await getWeeksByCourse(cId);
      setWeeks(weeksData);
      const allSessions = await Promise.all(
        weeksData.map((w) => getSessionsByWeek(w.id).then((s) => s.map((session) => ({ ...session, weekTitle: w.title }))))
      );
      setSessions(allSessions.flat());
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    loadSessionsForCourse(courseId);
  }, [courseId]);

  async function handleStatusChange(session, newStatus) {
    try {
      await updateSessionStatus(session.id, newStatus);
      loadSessionsForCourse(courseId);
    } catch (err) {
      alert('Failed to update status');
    }
  }

  async function handleDelete(session) {
    const confirmed = window.confirm(`Cancel and remove "${session.title}"?`);
    if (!confirmed) return;
    try {
      await deleteLiveSession(session.id);
      loadSessionsForCourse(courseId);
    } catch (err) {
      alert('Failed to delete session');
    }
  }

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={liveStyles.filterBox}>
          <Select
            id="courseFilter"
            placeholder="Filter by course..."
            options={courseOptions}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Schedule Session
        </Button>
      </div>

      <Card>
        {!courseId ? (
          <p className={liveStyles.placeholderText}>Select a course above to view its scheduled sessions.</p>
        ) : loadingSessions ? (
          <p>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className={liveStyles.placeholderText}>No live sessions scheduled for this course yet.</p>
        ) : (
          <div className={liveStyles.sessionsList}>
            {sessions.map((session) => (
              <div key={session.id} className={liveStyles.sessionCard}>
                <div className={liveStyles.sessionIcon}>
                  <FiVideo />
                </div>
                <div className={liveStyles.sessionInfo}>
                  <p className={liveStyles.sessionTitle}>{session.title}</p>
                  <p className={liveStyles.sessionMeta}>
                    {session.weekTitle} · {session.meeting_platform} ·{' '}
                    {formatWallClockDate(session.scheduled_at)}, {formatWallClockTime(session.scheduled_at)}
                    {session.duration_minutes && ` · ${session.duration_minutes} min`}
                  </p>
                </div>
                <select
                  className={liveStyles.statusSelect}
                  value={session.status}
                  onChange={(e) => handleStatusChange(session, e.target.value)}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className={liveStyles.joinLink}>
                  Join Link
                </a>
                <button className={styles.iconButtonDanger} onClick={() => handleDelete(session)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <ScheduleSessionModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadSessionsForCourse(courseId);
          }}
        />
      )}
    </div>
  );
}

export default LiveSessions;