import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { updateLecture } from '../../api/lecturesApi';
import styles from '../Subjects/Subjects.module.css';

function EditLectureModal({ lecture, onClose, onSaved }) {
  const [title, setTitle] = useState(lecture.title);
  const [description, setDescription] = useState(lecture.description || '');
  const [lectureOrder, setLectureOrder] = useState(lecture.lecture_order);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await updateLecture(lecture.id, {
        title,
        description,
        lecture_order: Number(lectureOrder),
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lecture');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit Lecture" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <Input
          label="Lecture Title"
          id="editTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          label="Description"
          id="editDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Order (position within week)"
          id="editOrder"
          type="number"
          min="1"
          value={lectureOrder}
          onChange={(e) => setLectureOrder(e.target.value)}
          required
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.modalActions}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditLectureModal;