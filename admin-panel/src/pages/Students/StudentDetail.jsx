import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBookOpen,
    FiCheckCircle,
    FiUser,
} from 'react-icons/fi';
import Card from '../../components/Card/Card';
import { getStudentDetail } from '../../api/usersApi';
import { getFileUrl } from '../../utils/urls';
import { usePageTitle } from '../../context/PageTitleContext';
import styles from './Students.module.css';

function initials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

function StudentDetail() {
    const { id } = useParams();
    const { setPageTitle } = usePageTitle();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const result = await getStudentDetail(id);
                setData(result);
                setPageTitle(result.profile.full_name);
            } catch (err) {
                console.error('Failed to load student detail:', err);
                setError('Could not load this student.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return <p>Loading student...</p>;
    }

    if (error || !data) {
        return (
            <div>
                <Link to="/students" className={styles.backLink}>
                    <FiArrowLeft /> Back to Students
                </Link>
                <p>{error || 'Student not found.'}</p>
            </div>
        );
    }

    const { profile, enrollments, overallAttendanceRate } = data;

    return (
        <div>
            <Link to="/students" className={styles.backLink}>
                <FiArrowLeft /> Back to Students
            </Link>

            {/* ---------- Profile Hero ---------- */}
            <div className={styles.heroCard}>
                <div className={styles.avatarWrapper}>
                    {profile.profile_picture ? (
                        <img src={getFileUrl(profile.profile_picture)} alt={profile.full_name} className={styles.avatarImg} />
                    ) : (
                        <div className={styles.avatarFallback}>{initials(profile.full_name)}</div>
                    )}
                </div>

                <div className={styles.heroInfo}>
                    <div className={styles.heroTopRow}>
                        <h2 className={styles.studentName}>{profile.full_name}</h2>
                        <span className={profile.is_active ? styles.statusActive : styles.statusInactive}>
                            {profile.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                            <FiMail className={styles.metaIcon} />
                            <span>{profile.email}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <FiPhone className={styles.metaIcon} />
                            <span>{profile.phone || 'Not provided'}</span>
                        </div>
                        {(profile.city || profile.state) && (
                            <div className={styles.metaItem}>
                                <FiMapPin className={styles.metaIcon} />
                                <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                            </div>
                        )}
                        {profile.education && (
                            <div className={styles.metaItem}>
                                <FiUser className={styles.metaIcon} />
                                <span>{profile.education}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{enrollments.length}</span>
                        <span className={styles.statLabel}>Courses Enrolled</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>
                            {overallAttendanceRate === null ? '—' : `${overallAttendanceRate}%`}
                        </span>
                        <span className={styles.statLabel}>Overall Attendance</span>
                    </div>
                </div>
            </div>

            {/* ---------- Enrolled Courses ---------- */}
            <h3 className={styles.sectionTitle}>Enrolled Courses</h3>

            {enrollments.length === 0 ? (
                <Card>
                    <p className={styles.emptyState}>Not enrolled in any course yet.</p>
                </Card>
            ) : (
                <div className={styles.courseGrid}>
                    {enrollments.map((e) => (
                        <Card key={e.enrollment_id}>
                            <div className={styles.courseCardHead}>
                                <div className={styles.courseIconWrap}>
                                    <FiBookOpen />
                                </div>
                                <div>
                                    <p className={styles.courseTitle}>{e.course_title}</p>
                                    <p className={styles.courseSub}>{e.subject_name} · {e.teacher_name}</p>
                                </div>
                                <span className={styles[`enrollStatus_${e.enrollment_status}`] || styles.enrollStatus_default}>
                                    {e.enrollment_status}
                                </span>
                            </div>

                            <div className={styles.progressWrapper}>
                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${e.computed_progress_percentage}%` }}
                                    />
                                </div>
                                <span className={styles.progressText}>{e.computed_progress_percentage}%</span>
                            </div>

                            <div className={styles.courseFooter}>
                                <span className={styles.attendanceNote}>
                                    <FiCheckCircle className={styles.metaIcon} />
                                    Attended {e.sessions_attended} of {e.sessions_held} live sessions held
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentDetail;