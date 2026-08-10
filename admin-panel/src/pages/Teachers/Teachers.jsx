
import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Pagination from '../../components/Pagination/Pagination';
import { getAllUsers, deleteUser } from '../../api/usersApi';
import { usePagination } from '../../hooks/usePagination';
import styles from '../Subjects/Subjects.module.css';
import searchStyles from '../Students/Students.module.css';
import { getPendingTeachers, approveTeacher, rejectTeacher } from '../../api/usersApi';
import toast from 'react-hot-toast';
import Button from '../../components/Button/Button';

const ITEMS_PER_PAGE = 10;

function Teachers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingTeachers, setPendingTeachers] = useState([]);

  async function loadPending() {
  try {
    const data = await getPendingTeachers();
    setPendingTeachers(data);
  } catch (err) {
    console.error('Failed to load pending teachers:', err);
  }
}

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setAllUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
      loadPending();

  }, []);

  async function handleApprove(teacher) {
  try {
    await approveTeacher(teacher.id);
    toast.success(`${teacher.full_name} approved.`);
    loadPending();
    loadUsers();
  } catch (err) {
    toast.error('Failed to approve teacher');
  }
}

async function handleReject(teacher) {
  const confirmed = window.confirm(`Reject ${teacher.full_name}'s application?`);
  if (!confirmed) return;
  try {
    await rejectTeacher(teacher.id);
    toast.success(`${teacher.full_name} rejected.`);
    loadPending();
  } catch (err) {
    toast.error('Failed to reject teacher');
  }
}

  const teachers = useMemo(
    () => allUsers.filter((u) => u.role === 'teacher'),
    [allUsers]
  );

  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers;
    const term = searchTerm.toLowerCase();
    return teachers.filter(
      (t) => t.full_name.toLowerCase().includes(term) || t.email.toLowerCase().includes(term)
    );
  }, [teachers, searchTerm]);

  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(filteredTeachers, ITEMS_PER_PAGE);

  async function handleDelete(teacher) {
    const confirmed = window.confirm(`Deactivate ${teacher.full_name}'s account?`);
    if (!confirmed) return;
    try {
      await deleteUser(teacher.id);
      loadUsers();
    } catch (err) {
      alert('Failed to deactivate teacher');
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageSubtitle}>{filteredTeachers.length} teachers</p>
        <div className={searchStyles.searchBox}>
          <FiSearch className={searchStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              goToPage(1);
            }}
            className={searchStyles.searchInput}
          />
        </div>
      </div>
{pendingTeachers.length > 0 && (
  <Card className={searchStyles.pendingCard}>
    <p className={styles.pageSubtitle} style={{ marginBottom: '12px' }}>
      {pendingTeachers.length} pending teacher application{pendingTeachers.length > 1 ? 's' : ''}
    </p>
    {pendingTeachers.map((t) => (
      <div key={t.id} className={searchStyles.pendingRow}>
        <div>
          <strong>{t.full_name}</strong>
          <span className={searchStyles.pendingEmail}> — {t.email}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary" onClick={() => handleApprove(t)}>Approve</Button>
          <Button variant="outline" onClick={() => handleReject(t)}>Reject</Button>
        </div>
      </div>
    ))}
  </Card>
)}
      <Card>
        {loading ? (
          <p>Loading teachers...</p>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className={styles.nameCell}>{teacher.full_name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.phone || '—'}</td>
                      <td>
                        <span className={teacher.is_active ? styles.statusActive : styles.statusInactive}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className={styles.iconButtonDanger} onClick={() => handleDelete(teacher)}>
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTeachers.length === 0 && (
              <p className={searchStyles.emptyState}>No teachers found.</p>
            )}

            {filteredTeachers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                totalItems={filteredTeachers.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default Teachers;