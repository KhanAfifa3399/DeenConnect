import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiChevronDown,
    FiChevronRight,
    FiVideo,
    FiClock,
    FiUpload,
    FiCamera,
    FiUser,
    FiCalendar,
    FiDollarSign,
    FiEdit2,
    FiTrash2,
    FiInbox,
} from 'react-icons/fi';
import Card from '../../components/Card/Card';
import { getCourseById, uploadCourseThumbnail } from '../../api/coursesApi';
import { getFileUrl } from '../../utils/urls';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';
import { deleteLecture } from '../../api/lecturesApi';
import { usePageTitle } from '../../context/PageTitleContext';
import styles from './CourseDetails.module.css';
import UploadLectureModal from './UploadLectureModal';
import EditLectureModal from './EditLectureModal';

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
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const thumbnailInputRef = useRef(null);

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

    function handleThumbnailClick() {
        thumbnailInputRef.current?.click();
    }

    async function handleThumbnailChange(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setCourse((prev) => ({ ...prev, thumbnail: previewUrl }));
        setThumbnailUploading(true);
        try {
            const updated = await uploadCourseThumbnail(id, file);
            setCourse((prev) => ({ ...prev, thumbnail: updated?.thumbnail || previewUrl }));
        } catch (err) {
            console.error('Failed to upload thumbnail:', err);
            alert('Failed to upload thumbnail image.');
        } finally {
            setThumbnailUploading(false);
        }
    }

    function resolveThumbnailSrc(thumbnail) {
        if (!thumbnail) return null;
        // Local preview (URL.createObjectURL) or an already-absolute URL — use as-is.
        if (thumbnail.startsWith('blob:') || thumbnail.startsWith('http')) return thumbnail;
        return getFileUrl(thumbnail);
    }

    if (loading) return <p>Loading course...</p>;
    if (!course) return <p>Course not found.</p>;

    return (
        <div>
            <Link to="/courses" className={styles.backLink}>
                <FiArrowLeft /> Back to Courses
            </Link>

            <div className={styles.heroCard}>
                <div className={styles.thumbnailWrapper}>
                    <div className={styles.thumbnail}>
                        {course.thumbnail ? (
                            <img src={resolveThumbnailSrc(course.thumbnail)} alt={course.title} />
                        ) : (
                            <span className={styles.thumbnailPlaceholder}>{course.title.charAt(0)}</span>
                        )}
                    </div>

                    {thumbnailUploading && (
                        <div className={styles.thumbnailUploadOverlay}>
                            <div className={styles.spinner} />
                        </div>
                    )}

                    <button
                        type="button"
                        className={styles.thumbnailEditButton}
                        onClick={handleThumbnailClick}
                        title="Change course thumbnail"
                    >
                        <FiCamera />
                    </button>
                    <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenFileInput}
                        onChange={handleThumbnailChange}
                    />
                </div>

                <div className={styles.heroInfo}>
                    <span className={styles.subjectTag}>{course.subject_name}</span>
                    <h1 className={styles.courseTitle}>{course.title}</h1>
                    <p className={styles.courseDescription}>{course.description || 'No description provided.'}</p>

                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <FiUser className={styles.metaIcon} />
                            <div className={styles.metaText}>
                                <span className={styles.metaLabel}>Teacher</span>
                                <span className={styles.metaValue}>{course.teacher_name}</span>
                            </div>
                        </div>
                        <div className={styles.metaItem}>
                            <FiCalendar className={styles.metaIcon} />
                            <div className={styles.metaText}>
                                <span className={styles.metaLabel}>Duration</span>
                                <span className={styles.metaValue}>{course.duration_months} mo · {course.total_weeks} wks</span>
                            </div>
                        </div>
                        <div className={styles.metaItem}>
                            <FiDollarSign className={styles.metaIcon} />
                            <div className={styles.metaText}>
                                <span className={styles.metaLabel}>Price</span>
                                <span className={styles.metaValue}>{Number(course.price) === 0 ? 'Free' : `$${course.price}`}</span>
                            </div>
                        </div>
                        <div className={styles.metaItem}>
                            <div className={styles.metaText}>
                                <span className={styles.metaLabel}>Status</span>
                                <span className={`${styles.metaValue} ${styles.statusBadge}`}>{course.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Course Content</h2>
                <span className={styles.sectionSubtitle}>{weeks.length} weeks</span>
            </div>

            <div className={styles.weeksList}>
                {weeks.map((week) => (
                    <Card key={week.id} className={styles.weekCard}>
                        <button className={styles.weekHeader} onClick={() => toggleWeek(week.id)}>
                            <div className={styles.weekHeaderLeft}>
                                <span className={styles.weekChevron}>
                                    {expandedWeek === week.id ? <FiChevronDown /> : <FiChevronRight />}
                                </span>
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
                                                <span className={styles.lectureIconBadge}>
                                                    <FiVideo />
                                                </span>
                                                <div className={styles.lectureTextGroup}>
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
                                                    title="Edit lecture"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    className={styles.lectureActionButtonDanger}
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteLecture(lecture); }}
                                                    title="Delete lecture"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <FiInbox className={styles.emptyStateIcon} />
                                        <p className={styles.emptyText}>No lectures added yet for this week.</p>
                                    </div>
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