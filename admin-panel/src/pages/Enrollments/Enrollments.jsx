import { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Select from '../../components/Select/Select';
import { getAllCourses } from '../../api/coursesApi';
import { getCourseEnrollments } from '../../api/enrollmentsApi';
import styles from '../Subjects/Subjects.module.css';
import enrollStyles from './Enrollments.module.css';

function Enrollments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getAllCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setEnrollments([]);
      return;
    }

    async function loadEnrollments() {
      setLoadingEnrollments(true);
      try {
        const data = await getCourseEnrollments(selectedCourseId);
        setEnrollments(data);
      } catch (err) {
        console.error('Failed to load enrollments:', err);
      } finally {
        setLoadingEnrollments(false);
      }
    }
    loadEnrollments();
  }, [selectedCourseId]);

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));

  const statusCounts = enrollments.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    },
    { active: 0, completed: 0, dropped: 0 }
  );

  return (
    <div>
      <Card className={enrollStyles.filterCard}>
        <Select
          label="Select a course to view its enrollments"
          id="courseSelect"
          placeholder={loadingCourses ? 'Loading courses...' : 'Choose a course...'}
          options={courseOptions}
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          disabled={loadingCourses}
        />
      </Card>

      {selectedCourseId && !loadingEnrollments && (
        <div className={enrollStyles.summaryRow}>
          <div className={enrollStyles.summaryItem}>
            <span className={enrollStyles.summaryValue}>{enrollments.length}</span>
            <span className={enrollStyles.summaryLabel}>Total Enrolled</span>
          </div>
          <div className={`${enrollStyles.summaryItem} ${enrollStyles.active}`}>
            <span className={enrollStyles.summaryValue}>{statusCounts.active}</span>
            <span className={enrollStyles.summaryLabel}>Active</span>
          </div>
          <div className={`${enrollStyles.summaryItem} ${enrollStyles.completed}`}>
            <span className={enrollStyles.summaryValue}>{statusCounts.completed}</span>
            <span className={enrollStyles.summaryLabel}>Completed</span>
          </div>
          <div className={`${enrollStyles.summaryItem} ${enrollStyles.dropped}`}>
            <span className={enrollStyles.summaryValue}>{statusCounts.dropped}</span>
            <span className={enrollStyles.summaryLabel}>Dropped</span>
          </div>
        </div>
      )}

      <Card>
        {!selectedCourseId ? (
          <p className={enrollStyles.placeholderText}>Select a course above to view enrolled students.</p>
        ) : loadingEnrollments ? (
          <p>Loading enrollments...</p>
        ) : enrollments.length === 0 ? (
          <p className={enrollStyles.placeholderText}>No students enrolled in this course yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className={styles.nameCell}>{enrollment.student_name}</td>
                    <td>{enrollment.student_email}</td>
                    <td>
                      <span className={enrollStyles[`badge_${enrollment.status}`]}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td>
                      <div className={enrollStyles.progressWrapper}>
                        <div className={enrollStyles.progressTrack}>
                          <div
                            className={enrollStyles.progressFill}
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          />
                        </div>
                        <span className={enrollStyles.progressText}>{enrollment.progress_percentage}%</span>
                      </div>
                    </td>
                    <td>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Enrollments;