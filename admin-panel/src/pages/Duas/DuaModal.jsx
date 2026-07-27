import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { createDua, updateDua } from '../../api/duasApi';
import styles from '../Subjects/Subjects.module.css';

function DuaModal({ editingDua, onClose, onSaved }) {
  const [title, setTitle] = useState(editingDua?.title || '');
  const [arabicText, setArabicText] = useState(editingDua?.arabic_text || '');
  const [transliteration, setTransliteration] = useState(editingDua?.transliteration || '');
  const [translation, setTranslation] = useState(editingDua?.translation || '');
  const [reference, setReference] = useState(editingDua?.reference || '');
  const [category, setCategory] = useState(editingDua?.category || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title,
      arabic_text: arabicText,
      transliteration,
      translation,
      reference,
      category,
    };

    try {
      if (editingDua) {
        await updateDua(editingDua.id, payload);
      } else {
        await createDua(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save dua');
    } finally {
      setSaving(false);
    }
  }

return (
  <Modal title={editingDua ? 'Edit Dua' : 'Add New Dua'} onClose={onClose} wide>
    <form onSubmit={handleSubmit} className={styles.modalForm}>
      <Input
        label="Title"
        id="duaTitle"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Dua Before Eating"
        required
      />

      <div className={styles.textareaWrapper}>
        <label className={styles.textareaLabel} htmlFor="arabicText">Arabic Text</label>
        <textarea
          id="arabicText"
          className={styles.textarea}
          value={arabicText}
          onChange={(e) => setArabicText(e.target.value)}
          rows={3}
          dir="rtl"
          lang="ar"
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: '1.4rem',
            lineHeight: 2,
            textAlign: 'right',
          }}
          required
        />
      </div>

      <Input
        label="Transliteration (optional)"
        id="transliteration"
        value={transliteration}
        onChange={(e) => setTransliteration(e.target.value)}
        placeholder="e.g. Bismillahi wa 'ala barakatillah"
      />

      <div className={styles.textareaWrapper}>
        <label className={styles.textareaLabel} htmlFor="translation">Translation</label>
        <textarea
          id="translation"
          className={styles.textarea}
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          rows={3}
          required
        />
      </div>

      <Input
        label="Reference (optional)"
        id="reference"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="e.g. Sahih Bukhari 5376"
      />
      <Input
        label="Category (optional)"
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="e.g. Eating, Travel, Morning"
      />

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.modalActions}>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Dua'}
        </Button>
      </div>
    </form>
  </Modal>
);
}

export default DuaModal;