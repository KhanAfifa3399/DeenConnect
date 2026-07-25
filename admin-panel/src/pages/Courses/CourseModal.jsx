import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import { createCourse, updateCourse } from '../../api/coursesApi';
import styles from '../Subjects/Subjects.module.css';
import courseStyles from './Courses.module.css';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function CourseModal({ editingCourse, subjects, teachers, onClose, onSaved }) {
  const [title, setTitle] = useState(editingCourse?.title || '');
  const [slug, setSlug] = useState(editingCourse?.slug || '');
  const [subjectId, setSubjectId] = useState(editingCourse?.subject_id || '');
  const [teacherId, setTeacherId] = useState(editingCourse?.teacher_id || '');
  const [description, setDescription] = useState(editingCourse?.description || '');
  const [durationMonths, setDurationMonths] = useState(editingCourse?.duration_months || '');
  const [startDate, setStartDate] = useState(editingCourse?.start_date?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(editingCourse?.end_date?.split('T')[0] || '');
  const [price, setPrice] = useState(editingCourse?.price || '0');
  const [status, setStatus] = useState(editingCourse?.status || 'draft');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleTitleChange(value) {
    setTitle(value);
    if (!editingCourse) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        title,
        slug,
        subject_id: Number(subjectId),
        teacher_id: Number(teacherId),
        description,
        duration_months: Number(durationMonths),
        start_date: startDate,
        end_date: endDate,
        price: Number(price),
        status,
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
      } else {
        await createCourse(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  }

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.full_name }));
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
  <Modal title={editingCourse ? 'Edit Course' : 'Add New Course'} onClose={onClose} wide>
    <form onSubmit={handleSubmit} className={courseStyles.compactForm}>
      <div className={courseStyles.grid2}>
        <Input
          label="Course Title"
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Tajweed Fundamentals"
          required
        />
        <Input
          label="Slug"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>

      <div className={courseStyles.grid2}>
        <Select
          label="Subject"
          id="subject"
          placeholder="Select a subject..."
          options={subjectOptions}
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
        />
        <Select
          label="Teacher"
          id="teacher"
          placeholder="Select a teacher..."
          options={teacherOptions}
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
        />
      </div>

      <div className={courseStyles.textareaWrapper}>
        <label htmlFor="description" className={courseStyles.textareaLabel}>Description</label>
        <textarea
          id="description"
          className={courseStyles.textareaCompact}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className={courseStyles.grid3}>
        <Input
          label="Duration (months)"
          id="duration"
          type="number"
          min="1"
          value={durationMonths}
          onChange={(e) => setDurationMonths(e.target.value)}
          required
        />
        <Input
          label="Price"
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Select
          label="Status"
          id="status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>

      <div className={courseStyles.grid2}>
        <Input
          label="Start Date"
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="End Date"
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {editingCourse && (
        <p className={courseStyles.calculatedNote}>
          Currently spans <strong>{editingCourse.total_weeks} weeks</strong> (auto-calculated). Changing duration recalculates this on save.
        </p>
      )}

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.modalActions}>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Course'}
        </Button>
      </div>
    </form>
  </Modal>
);
}

export default CourseModal;