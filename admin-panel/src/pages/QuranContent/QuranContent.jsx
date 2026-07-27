import { useState, useEffect } from 'react';
import { FiPlus, FiFileText, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { getContentByType, deleteQuranContent } from '../../api/quranContentApi';
import UploadQuranModal from './UploadQuranModal';
import styles from '../Subjects/Subjects.module.css';
import qStyles from './QuranContent.module.css';
import { getFileUrl } from '../../utils/urls';

function QuranContent() {
  const [activeTab, setActiveTab] = useState('surah');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadContent(type) {
    setLoading(true);
    try {
      const data = await getContentByType(type);
      setContent(data);
    } catch (err) {
      console.error('Failed to load Quran content:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContent(activeTab);
  }, [activeTab]);

  async function handleDelete(item) {
    const confirmed = window.confirm(`Remove PDF for "${item.name}"?`);
    if (!confirmed) return;
    try {
      await deleteQuranContent(item.id);
      loadContent(activeTab);
    } catch (err) {
      alert('Failed to remove');
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={qStyles.tabs}>
          <button
            className={activeTab === 'surah' ? `${qStyles.tab} ${qStyles.tabActive}` : qStyles.tab}
            onClick={() => setActiveTab('surah')}
          >
            By Surah (114)
          </button>
          <button
            className={activeTab === 'para' ? `${qStyles.tab} ${qStyles.tabActive}` : qStyles.tab}
            onClick={() => setActiveTab('para')}
          >
            By Para (30)
          </button>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Upload PDF
        </Button>
      </div>

      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : content.length === 0 ? (
          <p className={qStyles.emptyText}>
            No {activeTab === 'surah' ? 'Surah' : 'Para'} PDFs uploaded yet.
          </p>
        ) : (
          <div className={qStyles.grid}>
            {content.map((item) => (
              <div key={item.id} className={qStyles.contentCard}>
                <div className={qStyles.contentIcon}><FiFileText /></div>
                <div className={qStyles.contentInfo}>
                  <p className={qStyles.contentNumber}>
                    {activeTab === 'surah' ? 'Surah' : 'Para'} {item.number}
                  </p>
                  <p className={qStyles.contentName}>{item.name}</p>
                </div>
                <div className={qStyles.contentActions}>
                  <a href={getFileUrl(item.pdf_url)} target="_blank" rel="noopener noreferrer" className={qStyles.viewLink}>
                    View
                  </a>
                  <button className={styles.iconButtonDanger} onClick={() => handleDelete(item)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <UploadQuranModal
          defaultType={activeTab}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); loadContent(activeTab); }}
        />
      )}
    </div>
  );
}

export default QuranContent;