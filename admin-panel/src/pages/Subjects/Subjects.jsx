import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { getAllSubjects, deleteSubject } from '../../api/subjectsApi';
import SubjectModal from './SubjectModal';
import styles from './Subjects.module.css';
import toast from 'react-hot-toast';
// ...



function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  async function loadSubjects() {
    setLoading(true);
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  function handleAddNew() {
    setEditingSubject(null);
    setModalOpen(true);
  }

  function handleEdit(subject) {
    setEditingSubject(subject);
    setModalOpen(true);
  }

async function handleDelete(subject) {
    const confirmed = window.confirm(`Deactivate "${subject.name}"? This can be reversed later.`);
    if (!confirmed) return;

    try {
      await deleteSubject(subject.id);
      toast.success(`"${subject.name}" was removed.`);
      loadSubjects();
    } catch (err) {
      toast.error('Failed to delete subject');
    }
}

function handleSaved() {
    setModalOpen(false);
    toast.success(editingSubject ? 'Subject updated successfully.' : 'Subject created successfully.');
    loadSubjects();
}

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageSubtitle}>{subjects.length} subjects total</p>
        <Button variant="primary" onClick={handleAddNew}>
          <FiPlus /> Add Subject
        </Button>
      </div>

      <Card>
        {loading ? (
          <p>Loading subjects...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className={styles.nameCell}>{subject.name}</td>
                  <td><span className={styles.slugBadge}>{subject.slug}</span></td>
                  <td className={styles.descCell}>{subject.description || '—'}</td>
                  <td>
                    <span className={subject.is_active ? styles.statusActive : styles.statusInactive}>
                      {subject.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.iconButton} onClick={() => handleEdit(subject)}>
                        <FiEdit2 />
                      </button>
                      <button className={styles.iconButtonDanger} onClick={() => handleDelete(subject)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modalOpen && (
        <SubjectModal
          editingSubject={editingSubject}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Subjects;