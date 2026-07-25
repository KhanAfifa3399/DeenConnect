import { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Select from '../../components/Select/Select';
import { getAllCourses } from '../../api/coursesApi';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getSessionsByWeek } from '../../api/liveSessionsApi';
import { getSessionAttendance, markAttendance } from '../../api/attendanceApi';
import styles from '../Subjects/Subjects.module.css';
import attStyles from './Attendance.module.css';

function Attendance() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [roster, setRoster] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    getAllCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    if (!courseId) {
      setSessions([]);
      setSessionId('');
      return;
    }
    setLoadingSessions(true);
    setSessionId('');
    async function loadSessions() {
      const weeks = await getWeeksByCourse(courseId);
      const allSessions = await Promise.all(
        weeks.map((w) => getSessionsByWeek(w.id).then((s) => s.map((sess) => ({ ...sess, weekTitle: w.title }))))
      );
      setSessions(allSessions.flat());
      setLoadingSessions(false);
    }
    loadSessions();
  }, [courseId]);

  useEffect(() => {
    if (!sessionId) {
      setRoster([]);
      return;
    }
    setLoadingRoster(true);
    getSessionAttendance(sessionId)
      .then(setRoster)
      .catch(console.error)
      .finally(() => setLoadingRoster(false));
  }, [sessionId]);

  async function handleMark(student, status) {
    setSavingId(student.student_id);
    try {
      await markAttendance(sessionId, student.student_id, status, null);
      setRoster((prev) =>
        prev.map((s) => (s.student_id === student.student_id ? { ...s, status } : s))
      );
    } catch (err) {
      alert('Failed to mark attendance');
    } finally {
      setSavingId(null);
    }
  }

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));
  const sessionOptions = sessions.map((s) => ({
    value: s.id,
    label: `${s.title} — ${new Date(s.scheduled_at).toLocaleDateString()}`,
  }));

  const statusButtons = [
    { value: 'present', label: 'Present' },
    { value: 'late', label: 'Late' },
    { value: 'absent', label: 'Absent' },
    { value: 'excused', label: 'Excused' },
  ];

  return (
    <div>
      <div className={attStyles.filtersRow}>
        <Select
          label="Course"
          id="attCourse"
          placeholder="Select a course..."
          options={courseOptions}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        />
        <Select
          label="Live Session"
          id="attSession"
          placeholder={loadingSessions ? 'Loading...' : !courseId ? 'Select a course first' : 'Select a session...'}
          options={sessionOptions}
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          disabled={!courseId || loadingSessions}
        />
      </div>

      <Card>
        {!sessionId ? (
          <p className={attStyles.placeholderText}>Select a course and session above to take attendance.</p>
        ) : loadingRoster ? (
          <p>Loading roster...</p>
        ) : roster.length === 0 ? (
          <p className={attStyles.placeholderText}>No students enrolled in this course.</p>
        ) : (
          <div className={attStyles.rosterList}>
            {roster.map((student) => (
              <div key={student.student_id} className={attStyles.rosterRow}>
                <span className={attStyles.studentName}>{student.student_name}</span>
                <div className={attStyles.statusButtons}>
                  {statusButtons.map((btn) => (
                    <button
                      key={btn.value}
                      className={
                        student.status === btn.value
                          ? `${attStyles.statusBtn} ${attStyles[`active_${btn.value}`]}`
                          : attStyles.statusBtn
                      }
                      onClick={() => handleMark(student, btn.value)}
                      disabled={savingId === student.student_id}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Attendance;