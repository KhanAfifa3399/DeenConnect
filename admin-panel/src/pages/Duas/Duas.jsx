import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { getAllDuas, deleteDua } from '../../api/duasApi';
import DuaModal from './DuaModal';
import styles from '../Subjects/Subjects.module.css';
import duaStyles from './Duas.module.css';

function Duas() {
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDua, setEditingDua] = useState(null);

  async function loadDuas() {
    setLoading(true);
    try {
      const data = await getAllDuas();
      setDuas(data);
    } catch (err) {
      console.error('Failed to load duas:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDuas();
  }, []);

  function handleAddNew() {
    setEditingDua(null);
    setModalOpen(true);
  }

  function handleEdit(dua) {
    setEditingDua(dua);
    setModalOpen(true);
  }

  async function handleDelete(dua) {
    const confirmed = window.confirm(`Delete "${dua.title}"?`);
    if (!confirmed) return;
    try {
      await deleteDua(dua.id);
      loadDuas();
    } catch (err) {
      alert('Failed to delete dua');
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageSubtitle}>{duas.length} duas</p>
        <Button variant="primary" onClick={handleAddNew}>
          <FiPlus /> Add Dua
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : duas.length === 0 ? (
        <Card><p className={duaStyles.emptyText}>No duas added yet.</p></Card>
      ) : (
        <div className={duaStyles.grid}>
          {duas.map((dua) => (
            <Card key={dua.id} className={duaStyles.duaCard}>
              <div className={duaStyles.duaHeader}>
                <h3 className={duaStyles.duaTitle}>{dua.title}</h3>
                <div className={duaStyles.duaActions}>
                  <button className={styles.iconButton} onClick={() => handleEdit(dua)}>
                    <FiEdit2 />
                  </button>
                  <button className={styles.iconButtonDanger} onClick={() => handleDelete(dua)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <p className={duaStyles.arabicText} dir="rtl">{dua.arabic_text}</p>
              {dua.transliteration && <p className={duaStyles.transliteration}>{dua.transliteration}</p>}
              <p className={duaStyles.translation}>{dua.translation}</p>
              <div className={duaStyles.duaFooter}>
                {dua.category && <span className={duaStyles.categoryTag}>{dua.category}</span>}
                {dua.reference && <span className={duaStyles.reference}>{dua.reference}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <DuaModal
          editingDua={editingDua}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); loadDuas(); }}
        />
      )}
    </div>
  );
}

export default Duas;