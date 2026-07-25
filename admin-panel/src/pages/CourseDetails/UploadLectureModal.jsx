import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { uploadLectureVideo } from '../../api/lecturesApi';
import styles from '../Subjects/Subjects.module.css';

function UploadLectureModal({ weekId, nextOrder, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a video file');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('week_id', weekId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('lecture_order', nextOrder);
    formData.append('video', file);

    try {
      await uploadLectureVideo(weekId, formData);
      onUploaded();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal title="Upload New Lecture" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <Input
          label="Lecture Title"
          id="lectureTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Introduction to Makharij"
          required
        />
        <Input
          label="Description"
          id="lectureDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of this lecture"
        />

        <div>
          <label className={styles.textareaLabel} htmlFor="videoFile">Video File</label>
          <input
            id="videoFile"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          {file && <p className={styles.pageSubtitle}>Selected: {file.name}</p>}
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.modalActions}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Lecture'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UploadLectureModal;