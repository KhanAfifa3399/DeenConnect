import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiBell } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { getAllAnnouncements, deleteAnnouncement } from '../../api/announcementsApi';
import AnnouncementModal from './AnnouncementModal';
import styles from '../Subjects/Subjects.module.css';
import annStyles from './Announcements.module.css';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function handleDelete(announcement) {
    const confirmed = window.confirm(`Remove "${announcement.title}"?`);
    if (!confirmed) return;
    try {
      await deleteAnnouncement(announcement.id);
      loadAnnouncements();
    } catch (err) {
      alert('Failed to remove announcement');
    }
  }

  const audienceLabels = { all: 'Everyone', students: 'Students', teachers: 'Teachers' };

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageSubtitle}>{announcements.length} announcements</p>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Post Announcement
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : announcements.length === 0 ? (
        <Card><p className={annStyles.emptyText}>No announcements posted yet.</p></Card>
      ) : (
        <div className={annStyles.list}>
          {announcements.map((ann) => (
            <Card key={ann.id} className={annStyles.annCard}>
              <div className={annStyles.annIcon}><FiBell /></div>
              <div className={annStyles.annBody}>
                <div className={annStyles.annHeader}>
                  <h3 className={annStyles.annTitle}>{ann.title}</h3>
                  <button className={styles.iconButtonDanger} onClick={() => handleDelete(ann)}>
                    <FiTrash2 />
                  </button>
                </div>
                <p className={annStyles.annMessage}>{ann.message}</p>
                <div className={annStyles.annMeta}>
                  <span className={annStyles.audienceTag}>{audienceLabels[ann.audience]}</span>
                  {ann.course_title && <span className={annStyles.courseTag}>{ann.course_title}</span>}
                  <span className={annStyles.dateText}>
                    by {ann.created_by_name} · {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <AnnouncementModal
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); loadAnnouncements(); }}
        />
      )}
    </div>
  );
}

export default Announcements;