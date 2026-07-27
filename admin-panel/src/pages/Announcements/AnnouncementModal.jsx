import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import { getAllCourses } from '../../api/coursesApi';
import { createAnnouncement } from '../../api/announcementsApi';
import styles from '../Subjects/Subjects.module.css';

function AnnouncementModal({ onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllCourses().then(setCourses).catch(console.error);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createAnnouncement({
        title,
        message,
        audience,
        course_id: courseId ? Number(courseId) : null,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSaving(false);
    }
  }

  const audienceOptions = [
    { value: 'all', label: 'Everyone' },
    { value: 'students', label: 'Students Only' },
    { value: 'teachers', label: 'Teachers Only' },
  ];
  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));

  return (
    <Modal title="Post Announcement" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <Input
          label="Title"
          id="annTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ramadan Schedule Update"
          required
        />
        <div className={styles.textareaWrapper}>
          <label className={styles.textareaLabel} htmlFor="annMessage">Message</label>
          <textarea
            id="annMessage"
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
        </div>
        <Select
          label="Audience"
          id="annAudience"
          options={audienceOptions}
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />
        <Select
          label="Specific Course (optional)"
          id="annCourse"
          placeholder="Platform-wide (no specific course)"
          options={courseOptions}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.modalActions}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Posting...' : 'Post Announcement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AnnouncementModal;