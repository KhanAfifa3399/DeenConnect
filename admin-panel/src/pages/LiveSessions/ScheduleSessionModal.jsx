import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import { getAllCourses } from '../../api/coursesApi';
import { getWeeksByCourse } from '../../api/weeksApi';
import { createLiveSession } from '../../api/liveSessionsApi';
import styles from '../Subjects/Subjects.module.css';
import courseStyles from '../Courses/Courses.module.css';

function ScheduleSessionModal({ onClose, onSaved }) {
  const [courses, setCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [weekId, setWeekId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState('zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [sessionDate, setSessionDate] = useState('');
const [sessionHour, setSessionHour] = useState('17');
const [sessionMinute, setSessionMinute] = useState('00'); 
 const [durationMinutes, setDurationMinutes] = useState('45');
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllCourses().then(setCourses).catch(() => setError('Failed to load courses'));
  }, []);

  useEffect(() => {
    if (!courseId) {
      setWeeks([]);
      setWeekId('');
      return;
    }
    setLoadingWeeks(true);
    setWeekId('');
    getWeeksByCourse(courseId)
      .then(setWeeks)
      .catch(() => setError('Failed to load weeks'))
      .finally(() => setLoadingWeeks(false));
  }, [courseId]);

async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!sessionDate) {
      setError('Please select a date.');
      return;
    }

    const paddedTime = `${sessionHour.padStart(2, '0')}:${sessionMinute.padStart(2, '0')}`;
    const isoString = new Date(`${sessionDate}T${paddedTime}:00`).toISOString();

    setSaving(true);
    try {
      await createLiveSession({
        week_id: Number(weekId),
        title,
        description,
        meeting_platform: meetingPlatform,
        meeting_link: meetingLink,
        scheduled_at: isoString,
        duration_minutes: Number(durationMinutes),
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setSaving(false);
    }
}

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));
  const weekOptions = weeks.map((w) => ({ value: w.id, label: w.title }));
  const platformOptions = [
    { value: 'zoom', label: 'Zoom' },
    { value: 'google_meet', label: 'Google Meet' },
    { value: 'jitsi', label: 'Jitsi' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Modal title="Schedule Live Session" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className={courseStyles.compactForm}>
        <div className={courseStyles.grid2}>
          <Select
            label="Course"
            id="course"
            placeholder="Select a course..."
            options={courseOptions}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          />
          <Select
            label="Week"
            id="week"
            placeholder={loadingWeeks ? 'Loading weeks...' : !courseId ? 'Select a course first' : 'Select a week...'}
            options={weekOptions}
            value={weekId}
            onChange={(e) => setWeekId(e.target.value)}
            disabled={!courseId || loadingWeeks}
            required
          />
        </div>

        <Input
          label="Session Title"
          id="sessionTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Live Q&A: Tajweed Rules"
          required
        />

        <div className={courseStyles.grid2}>
          <Select
            label="Platform"
            id="platform"
            options={platformOptions}
            value={meetingPlatform}
            onChange={(e) => setMeetingPlatform(e.target.value)}
          />
          <Input
            label="Meeting Link"
            id="meetingLink"
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            required
          />
        </div>

       <div className={courseStyles.grid3}>
  <Input
    label="Date"
    id="sessionDate"
    type="date"
    value={sessionDate}
    onChange={(e) => setSessionDate(e.target.value)}
    required
  />
  <Select
    label="Hour (24h)"
    id="sessionHour"
    options={Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: String(i).padStart(2, '0') }))}
    value={sessionHour}
    onChange={(e) => setSessionHour(e.target.value)}
  />
  <Select
    label="Minute"
    id="sessionMinute"
    options={['00', '15', '30', '45'].map((m) => ({ value: m, label: m }))}
    value={sessionMinute}
    onChange={(e) => setSessionMinute(e.target.value)}
  />
</div>

        <Input
          label="Duration (minutes)"
          id="duration"
          type="number"
          min="1"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.modalActions}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ScheduleSessionModal;