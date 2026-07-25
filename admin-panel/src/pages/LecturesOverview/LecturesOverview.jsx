import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiVideo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Pagination from '../../components/Pagination/Pagination';
import { getAllCourses } from '../../api/coursesApi';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';
import { usePagination } from '../../hooks/usePagination';
import styles from '../Subjects/Subjects.module.css';
import searchStyles from '../Students/Students.module.css';
import ownStyles from './LecturesOverview.module.css';

const ITEMS_PER_PAGE = 15;

function LecturesOverview() {
  const [allLectures, setAllLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [videoFilter, setVideoFilter] = useState('all');

  useEffect(() => {
    async function loadEverything() {
      setLoading(true);
      try {
        const courses = await getAllCourses();
        const results = [];

        for (const course of courses) {
          const weeks = await getWeeksByCourse(course.id);
          const weekLectures = await Promise.all(
            weeks.map((w) => getLecturesByWeek(w.id).then((lectures) =>
              lectures.map((l) => ({
                ...l,
                courseId: course.id,
                courseTitle: course.title,
                weekTitle: w.title,
              }))
            ))
          );
          results.push(...weekLectures.flat());
        }

        setAllLectures(results);
      } catch (err) {
        console.error('Failed to load lectures overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEverything();
  }, []);

  const filteredLectures = useMemo(() => {
    let list = allLectures;

    if (videoFilter === 'missing') {
      list = list.filter((l) => !l.video_url);
    } else if (videoFilter === 'uploaded') {
      list = list.filter((l) => l.video_url);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(term) ||
          l.courseTitle.toLowerCase().includes(term)
      );
    }

    return list;
  }, [allLectures, searchTerm, videoFilter]);

  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(filteredLectures, ITEMS_PER_PAGE);

  const missingCount = allLectures.filter((l) => !l.video_url).length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageSubtitle}>
          {allLectures.length} lectures total
          {missingCount > 0 && ` · ${missingCount} missing video`}
        </p>
        <div className={ownStyles.controls}>
          <select
            className={ownStyles.filterSelect}
            value={videoFilter}
            onChange={(e) => { setVideoFilter(e.target.value); goToPage(1); }}
          >
            <option value="all">All lectures</option>
            <option value="missing">Missing video</option>
            <option value="uploaded">Has video</option>
          </select>
          <div className={searchStyles.searchBox}>
            <FiSearch className={searchStyles.searchIcon} />
            <input
              type="text"
              placeholder="Search lecture or course..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); goToPage(1); }}
              className={searchStyles.searchInput}
            />
          </div>
        </div>
      </div>

      <Card>
        {loading ? (
          <p>Loading lectures across all courses...</p>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Lecture</th>
                    <th>Course</th>
                    <th>Week</th>
                    <th>Duration</th>
                    <th>Video</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((lecture) => (
                    <tr key={lecture.id}>
                      <td className={styles.nameCell}>{lecture.title}</td>
                      <td>
                        <Link to={`/courses/${lecture.courseId}`} className={ownStyles.courseLink}>
                          {lecture.courseTitle}
                        </Link>
                      </td>
                      <td>{lecture.weekTitle}</td>
                      <td>{lecture.duration_minutes ? `${lecture.duration_minutes} min` : '—'}</td>
                      <td>
                        {lecture.video_url ? (
                          <span className={ownStyles.hasVideo}><FiVideo /> Uploaded</span>
                        ) : (
                          <span className={ownStyles.noVideo}>Missing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLectures.length === 0 && (
              <p className={searchStyles.emptyState}>No lectures match your filters.</p>
            )}

            {filteredLectures.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                totalItems={filteredLectures.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default LecturesOverview;