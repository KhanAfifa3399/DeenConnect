import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import { uploadQuranContent } from '../../api/quranContentApi';
import styles from '../Subjects/Subjects.module.css';

function UploadQuranModal({ defaultType, onClose, onSaved }) {
  const [type, setType] = useState(defaultType);
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const maxNumber = type === 'surah' ? 114 : 30;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    if (Number(number) < 1 || Number(number) > maxNumber) {
      setError(`Number must be between 1 and ${maxNumber} for ${type === 'surah' ? 'Surah' : 'Para'}`);
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('type', type);
    formData.append('number', number);
    formData.append('name', name);
    formData.append('pdf', file);

    try {
      await uploadQuranContent(formData);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Upload Quran PDF" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <Select
          label="Type"
          id="qType"
          options={[{ value: 'surah', label: 'Surah' }, { value: 'para', label: 'Para / Juz' }]}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <Input
          label={`${type === 'surah' ? 'Surah' : 'Para'} Number (1-${maxNumber})`}
          id="qNumber"
          type="number"
          min="1"
          max={maxNumber}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <Input
          label="Name"
          id="qName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === 'surah' ? 'e.g. Al-Fatihah' : 'e.g. Alif Lam Meem'}
          required
        />
        <div>
          <label className={styles.textareaLabel} htmlFor="qPdf">PDF File</label>
          <input
            id="qPdf"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.modalActions}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UploadQuranModal;