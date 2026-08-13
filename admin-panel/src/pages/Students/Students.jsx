import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Pagination from '../../components/Pagination/Pagination';
import { getAllUsers, deleteUser } from '../../api/usersApi';
import { usePagination } from '../../hooks/usePagination';
import styles from '../Subjects/Subjects.module.css';
import searchStyles from './Students.module.css';

const ITEMS_PER_PAGE = 10;

function Students() {
  const navigate = useNavigate();
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

  const students = useMemo(
    () => allUsers.filter((u) => u.role === 'student'),
    [allUsers]
  );

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) => s.full_name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(filteredStudents, ITEMS_PER_PAGE);

  async function handleDelete(e, student) {
    e.stopPropagation();
    const confirmed = window.confirm(`Deactivate ${student.full_name}'s account?`);
    if (!confirmed) return;
    try {
      await deleteUser(student.id);
      loadUsers();
    } catch (err) {
      alert('Failed to deactivate student');
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageSubtitle}>{filteredStudents.length} students</p>
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
          <p>Loading students...</p>
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
                {paginatedItems.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className={searchStyles.clickableRow}
                  >
                    <td className={styles.nameCell}>{student.full_name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '—'}</td>
                    <td>
                      <span className={student.is_active ? styles.statusActive : styles.statusInactive}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className={styles.iconButtonDanger} onClick={(e) => handleDelete(e, student)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
            {filteredStudents.length === 0 && (
              <p className={searchStyles.emptyState}>No students found.</p>
            )}

            {filteredStudents.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                totalItems={filteredStudents.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default Students;