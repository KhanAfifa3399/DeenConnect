import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { createSubject, updateSubject } from '../../api/subjectsApi';
import styles from './Subjects.module.css';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function SubjectModal({ editingSubject, onClose, onSaved }) {
  const [name, setName] = useState(editingSubject?.name || '');
  const [slug, setSlug] = useState(editingSubject?.slug || '');
  const [description, setDescription] = useState(editingSubject?.description || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleNameChange(value) {
    setName(value);
    if (!editingSubject) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = { name, slug, description };
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
      } else {
        await createSubject(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editingSubject ? 'Edit Subject' : 'Add New Subject'} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <Input
          label="Subject Name"
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Fiqh"
          required
        />
        <Input
          label="Slug"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. fiqh"
          required
        />
        <div className={styles.textareaWrapper}>
          <label htmlFor="description" className={styles.textareaLabel}>Description</label>
          <textarea
            id="description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this subject"
            rows={3}
          />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.modalActions}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SubjectModal;