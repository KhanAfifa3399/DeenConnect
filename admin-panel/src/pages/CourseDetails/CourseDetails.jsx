import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown, FiChevronRight, FiVideo, FiClock, FiUpload } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import { getCourseById } from '../../api/coursesApi';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';
import { usePageTitle } from '../../context/PageTitleContext';
import styles from './CourseDetails.module.css';
import UploadLectureModal from './UploadLectureModal';
import EditLectureModal from './EditLectureModal';
import { deleteLecture } from '../../api/lecturesApi';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

function CourseDetails() {
    const { id } = useParams();
    const { setPageTitle } = usePageTitle();
    const [course, setCourse] = useState(null);
    const [weeks, setWeeks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedWeek, setExpandedWeek] = useState(null);
    const [lecturesByWeek, setLecturesByWeek] = useState({});
    const [loadingLectures, setLoadingLectures] = useState(null);
    const [uploadModalWeek, setUploadModalWeek] = useState(null);
    const [editingLecture, setEditingLecture] = useState(null);

    useEffect(() => {
        async function loadCourseData() {
            setLoading(true);
            try {
                const [courseData, weeksData] = await Promise.all([
                    getCourseById(id),
                    getWeeksByCourse(id),
                ]);
                setCourse(courseData);
                setPageTitle(courseData.title);
                setWeeks(weeksData);
            } catch (err) {
                console.error('Failed to load course:', err);
            } finally {
                setLoading(false);
            }
        }
        loadCourseData();
    }, [id]);

    async function toggleWeek(weekId) {
        if (expandedWeek === weekId) {
            setExpandedWeek(null);
            return;
        }

        setExpandedWeek(weekId);

        if (!lecturesByWeek[weekId]) {
            setLoadingLectures(weekId);
            try {
                const lectures = await getLecturesByWeek(weekId);
                setLecturesByWeek((prev) => ({ ...prev, [weekId]: lectures }));
            } catch (err) {
                console.error('Failed to load lectures:', err);
            } finally {
                setLoadingLectures(null);
            }
        }
    }

    async function refreshWeekLectures(weekId) {
        const lectures = await getLecturesByWeek(weekId);
        setLecturesByWeek((prev) => ({ ...prev, [weekId]: lectures }));
    }

    function handleUploaded(weekId) {
        setUploadModalWeek(null);
        refreshWeekLectures(weekId);
    }

    async function handleDeleteLecture(lecture) {
        const confirmed = window.confirm(`Delete "${lecture.title}"?`);
        if (!confirmed) return;
        try {
            await deleteLecture(lecture.id);
            refreshWeekLectures(lecture.week_id);
        } catch (err) {
            alert('Failed to delete lecture');
        }
    }

    function handleLectureSaved() {
        const weekId = editingLecture.week_id;
        setEditingLecture(null);
        refreshWeekLectures(weekId);
    }
    if (loading) return <p>Loading course...</p>;
    if (!course) return <p>Course not found.</p>;

    return (
        <div>
            <Link to="/courses" className={styles.backLink}>
                <FiArrowLeft /> Back to Courses
            </Link>

            <div className={styles.heroCard}>
                <div className={styles.thumbnail}>
                    {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} />
                    ) : (
                        <span className={styles.thumbnailPlaceholder}>{course.title.charAt(0)}</span>
                    )}
                </div>
                <div className={styles.heroInfo}>
                    <span className={styles.subjectTag}>{course.subject_name}</span>
                    <h1 className={styles.courseTitle}>{course.title}</h1>
                    <p className={styles.courseDescription}>{course.description || 'No description provided.'}</p>
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Teacher</span>
                            <span className={styles.metaValue}>{course.teacher_name}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Duration</span>
                            <span className={styles.metaValue}>{course.duration_months} months · {course.total_weeks} weeks</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Price</span>
                            <span className={styles.metaValue}>{Number(course.price) === 0 ? 'Free' : `$${course.price}`}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Status</span>
                            <span className={styles.metaValue}>{course.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Course Content — {weeks.length} Weeks</h2>

            <div className={styles.weeksList}>
                {weeks.map((week) => (
                    <Card key={week.id} className={styles.weekCard}>
                        <button className={styles.weekHeader} onClick={() => toggleWeek(week.id)}>
                            <div className={styles.weekHeaderLeft}>
                                {expandedWeek === week.id ? <FiChevronDown /> : <FiChevronRight />}
                                <span className={styles.weekTitle}>{week.title}</span>
                            </div>
                            <span className={styles.weekLectureCount}>
                                {lecturesByWeek[week.id]?.length ?? '—'} lectures
                            </span>
                        </button>

                        {expandedWeek === week.id && (
                            <div className={styles.lecturesList}>
                                <div className={styles.uploadRow}>
                                    <button
                                        className={styles.uploadButton}
                                        onClick={(e) => { e.stopPropagation(); setUploadModalWeek(week.id); }}
                                    >
                                        <FiUpload /> Upload Lecture
                                    </button>
                                </div>

                                {loadingLectures === week.id ? (
                                    <p className={styles.loadingText}>Loading lectures...</p>
                                ) : lecturesByWeek[week.id]?.length > 0 ? (
                                    lecturesByWeek[week.id].map((lecture) => (
                                        <div key={lecture.id} className={styles.lectureItem}>
                                            <div className={styles.lectureInfo}>
                                                <FiVideo className={styles.lectureIcon} />
                                                <div>
                                                    <p className={styles.lectureTitle}>{lecture.title}</p>
                                                    {lecture.description && (
                                                        <p className={styles.lectureDesc}>{lecture.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.lectureMeta}>
                                                {lecture.duration_minutes && (
                                                    <span className={styles.durationBadge}>
                                                        <FiClock /> {lecture.duration_minutes} min
                                                    </span>
                                                )}
                                                {!lecture.video_url && (
                                                    <span className={styles.noVideoBadge}>No video uploaded</span>
                                                )}
                                                <button
                                                    className={styles.lectureActionButton}
                                                    onClick={(e) => { e.stopPropagation(); setEditingLecture(lecture); }}
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    className={styles.lectureActionButtonDanger}
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteLecture(lecture); }}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.emptyText}>No lectures added yet for this week.</p>
                                )}
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {uploadModalWeek && (
                <UploadLectureModal
                    weekId={uploadModalWeek}
                    nextOrder={(lecturesByWeek[uploadModalWeek]?.length || 0) + 1}
                    onClose={() => setUploadModalWeek(null)}
                    onUploaded={() => handleUploaded(uploadModalWeek)}
                />
            )}
            {editingLecture && (
                <EditLectureModal
                    lecture={editingLecture}
                    onClose={() => setEditingLecture(null)}
                    onSaved={handleLectureSaved}
                />
            )}
        </div>
    );
}

export default CourseDetails;