import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiBookOpen } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { getAllDailySurahs, createDailySurah, deleteDailySurah } from '../../api/dailySurahApi';
import styles from '../Subjects/Subjects.module.css';
import dsStyles from './DailySurah.module.css';

function DailySurah() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [surahNumber, setSurahNumber] = useState('');
  const [surahName, setSurahName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadSurahs() {
    setLoading(true);
    try {
      const data = await getAllDailySurahs();
      setSurahs(data);
    } catch (err) {
      console.error('Failed to load daily surahs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSurahs();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createDailySurah({ surah_number: Number(surahNumber), surah_name: surahName, note });
      setModalOpen(false);
      setSurahNumber('');
      setSurahName('');
      setNote('');
      loadSurahs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(surah) {
    const confirmed = window.confirm(`Remove "${surah.surah_name}" from the list?`);
    if (!confirmed) return;
    try {
      await deleteDailySurah(surah.id);
      loadSurahs();
    } catch (err) {
      alert('Failed to remove');
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageSubtitle}>{surahs.length} surahs in the daily list</p>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Add Surah
        </Button>
      </div>

      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : surahs.length === 0 ? (
          <p className={dsStyles.emptyText}>No surahs added yet.</p>
        ) : (
          <div className={dsStyles.list}>
            {surahs.map((surah) => (
              <div key={surah.id} className={dsStyles.row}>
                <div className={dsStyles.rowIcon}><FiBookOpen /></div>
                <div className={dsStyles.rowInfo}>
                  <p className={dsStyles.rowTitle}>Surah {surah.surah_number} — {surah.surah_name}</p>
                  {surah.note && <p className={dsStyles.rowNote}>{surah.note}</p>}
                </div>
                <button className={styles.iconButtonDanger} onClick={() => handleDelete(surah)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <Modal title="Add Daily Surah" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <Input
              label="Surah Number (1-114)"
              id="dsNumber"
              type="number"
              min="1"
              max="114"
              value={surahNumber}
              onChange={(e) => setSurahNumber(e.target.value)}
              required
            />
            <Input
              label="Surah Name"
              id="dsName"
              value={surahName}
              onChange={(e) => setSurahName(e.target.value)}
              placeholder="e.g. Al-Mulk"
              required
            />
            <Input
              label="Note (optional)"
              id="dsNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this Surah is recommended"
            />
            {error && <p className={styles.errorText}>{error}</p>}
            <div className={styles.modalActions}>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default DailySurah;