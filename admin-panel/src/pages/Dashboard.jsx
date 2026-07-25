import { useState, useEffect } from 'react';
import Card from '../components/Card/Card';
import { getDashboardStats } from '../api/statsApi';
import styles from './Dashboard.module.css';
import { FiUsers, FiUser, FiBook, FiGrid } from 'react-icons/fi';

const statCardsConfig = [
  { key: 'totalStudents', label: 'Total Students', icon: FiUsers, color: '#2A5A6D' },
  { key: 'totalTeachers', label: 'Total Teachers', icon: FiUser, color: '#5D8494' },
  { key: 'totalCourses', label: 'Total Courses', icon: FiBook, color: '#8FB7C2' },
  { key: 'totalSubjects', label: 'Total Subjects', icon: FiGrid, color: '#0A2E36' },
];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;

  return (
    <div>
      <div className={styles.statsGrid}>
        {statCardsConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} hoverable className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: card.color }}>
                <Icon className={styles.statIconSvg} />
              </div>
              <div>
                <p className={styles.statValue}>{stats[card.key]}</p>
                <p className={styles.statLabel}>{card.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className={styles.recentCard}>
        <h3 className={styles.sectionTitle}>Recent Registrations</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td><span className={styles.roleBadge}>{user.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default Dashboard;