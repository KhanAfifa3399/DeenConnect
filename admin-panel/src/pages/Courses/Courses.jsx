import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { getAllCourses, deleteCourse } from '../../api/coursesApi';
import { getAllSubjects } from '../../api/subjectsApi';
import { getTeachers } from '../../api/usersApi';
import CourseModal from './CourseModal';
import styles from '../Subjects/Subjects.module.css';
import courseStyles from './Courses.module.css';

function Courses() {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    async function loadAll() {
        setLoading(true);
        try {
            const [coursesData, subjectsData, teachersData] = await Promise.all([
                getAllCourses(),
                getAllSubjects(),
                getTeachers(),
            ]);
            setCourses(coursesData);
            setSubjects(subjectsData);
            setTeachers(teachersData);
        } catch (err) {
            console.error('Failed to load courses data:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    function handleAddNew() {
        setEditingCourse(null);
        setModalOpen(true);
    }

    function handleEdit(course) {
        setEditingCourse(course);
        setModalOpen(true);
    }

    async function handleDelete(course) {
        const confirmed = window.confirm(`Deactivate "${course.title}"?`);
        if (!confirmed) return;
        try {
            await deleteCourse(course.id);
            loadAll();
        } catch (err) {
            alert('Failed to deactivate course');
        }
    }

    function handleSaved() {
        setModalOpen(false);
        loadAll();
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <p className={styles.pageSubtitle}>{courses.length} courses total</p>
                <Button variant="primary" onClick={handleAddNew}>
                    <FiPlus /> Add Course
                </Button>
            </div>

            <Card>
                {loading ? (
                    <p>Loading courses...</p>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Duration</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td className={styles.nameCell}>
                                            <Link to={`/courses/${course.id}`} className={courseStyles.courseLink}>
                                                {course.title}
                                            </Link>
                                        </td>
                                        <td>{course.subject_name}</td>
                                        <td>{course.teacher_name}</td>
                                        <td>{course.duration_months} mo · {course.total_weeks} wks</td>
                                        <td>{Number(course.price) === 0 ? 'Free' : `$${course.price}`}</td>
                                        <td>
                                            <span className={courseStyles[`status_${course.status}`]}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.iconButton} onClick={() => handleEdit(course)}>
                                                    <FiEdit2 />
                                                </button>
                                                <button className={styles.iconButtonDanger} onClick={() => handleDelete(course)}>
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {modalOpen && (
                <CourseModal
                    editingCourse={editingCourse}
                    subjects={subjects}
                    teachers={teachers}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

export default Courses; 