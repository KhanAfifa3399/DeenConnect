
import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Pagination from '../../components/Pagination/Pagination';
import { getAllUsers, deleteUser } from '../../api/usersApi';
import { usePagination } from '../../hooks/usePagination';
import styles from '../Subjects/Subjects.module.css';
import searchStyles from '../Students/Students.module.css';

const ITEMS_PER_PAGE = 10;

function Teachers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
  }, []);

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