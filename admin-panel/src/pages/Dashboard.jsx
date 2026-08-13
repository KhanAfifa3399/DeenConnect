import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  FiUsers, FiUserCheck, FiBookOpen, FiTrendingUp, FiCheckCircle, FiUserPlus,
  FiVideo, FiActivity, FiRefreshCw, FiCheck, FiX, FiArrowRight,
} from 'react-icons/fi';
import Card from '../components/Card/Card';
import { getAllUsers, getPendingTeachers, approveTeacher, rejectTeacher } from '../api/usersApi';
import { getReportSummary } from '../api/reportsApi';
import { getRecentLogs } from '../api/activityLogsApi';
import { getTodaysSessions } from '../api/liveSessionsApi';
import styles from './Dashboard.module.css';

const AUTO_REFRESH_MS = 60000;

const kpiConfig = [
  { key: 'total_students', label: 'Total Students', icon: FiUsers, color: '#276749' },
  { key: 'total_teachers', label: 'Total Teachers', icon: FiUserCheck, color: '#318A5A' },
  { key: 'total_courses', label: 'Active Courses', icon: FiBookOpen, color: '#16806A' },
  { key: 'active_enrollments', label: 'Active Enrollments', icon: FiTrendingUp, color: '#164E63' },
];

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Dashboard() {
  const [report, setReport] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [reportData, users, pending, logs, sessions] = await Promise.all([
        getReportSummary(),
        getAllUsers(),
        getPendingTeachers(),
        getRecentLogs(),
        getTodaysSessions(),
      ]);
      setReport(reportData);
      setRecentUsers([...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6));
      setPendingTeachers(pending);
      setActivity(logs.slice(0, 8));
      setTodaysSessions(sessions);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadAll]);

  async function handleApprove(teacher) {
    try {
      await approveTeacher(teacher.id);
      toast.success(`${teacher.full_name} approved.`);
      loadAll();
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
      loadAll();
    } catch (err) {
      toast.error('Failed to reject teacher');
    }
  }

  if (loading) return <p>Loading dashboard...</p>;
  if (!report) return <p className={styles.errorText}>Failed to load dashboard data</p>;

  const { kpiSummary, monthlyReport, enrollmentsOverTime } = report;
  const trendData = enrollmentsOverTime.slice(-6).map((t) => ({ month: t.month, enrollments: Number(t.count) }));

  return (
    <div>
      {/* ---------- Header ---------- */}
      <div className={styles.pageHeaderRow}>
        <div>
          <h2 className={styles.welcomeTitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className={styles.welcomeSub}>Here's what's happening on DeenConnect today.</p>
        </div>
        <p className={styles.updatedNote}>
          <FiRefreshCw className={styles.refreshIcon} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
        </p>
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className={styles.statsGrid}>
        {kpiConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} hoverable className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: card.color }}>
                <Icon size={22} className={styles.statIconSvg} />
              </div>
              <div>
                <p className={styles.statValue}>{kpiSummary[card.key]}</p>
                <p className={styles.statLabel}>{card.label}</p>
              </div>
            </Card>
          );
        })}
        <Card hoverable className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#2E7D32' }}>
            <FiCheckCircle size={22} className={styles.statIconSvg} />
          </div>
          <div>
            <p className={styles.statValue}>
              {kpiSummary.overall_attendance_rate === null ? '—' : `${kpiSummary.overall_attendance_rate}%`}
            </p>
            <p className={styles.statLabel}>Overall Attendance</p>
          </div>
        </Card>
        <Link to="/teachers" className={styles.statCardLink}>
          <Card hoverable className={`${styles.statCard} ${pendingTeachers.length > 0 ? styles.statCardAlert : ''}`}>
            <div className={styles.statIcon} style={{ backgroundColor: '#ED6C02' }}>
              <FiUserPlus size={22} className={styles.statIconSvg} />
            </div>
            <div>
              <p className={styles.statValue}>{pendingTeachers.length}</p>
              <p className={styles.statLabel}>Pending Approvals</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* ---------- This Month strip ---------- */}
      <div className={styles.monthStrip}>
        <span className={styles.monthStripLabel}>{monthlyReport.month_label}:</span>
        <span className={styles.monthStripItem}><strong>{monthlyReport.new_enrollments}</strong> new enrollments</span>
        <span className={styles.monthStripDot}>·</span>
        <span className={styles.monthStripItem}><strong>{monthlyReport.sessions_held}</strong> live sessions</span>
        <span className={styles.monthStripDot}>·</span>
        <span className={styles.monthStripItem}>
          <strong>{monthlyReport.attendance_rate === null ? '—' : `${monthlyReport.attendance_rate}%`}</strong> attendance rate
        </span>
        <Link to="/reports" className={styles.monthStripLink}>
          Full report <FiArrowRight size={12} />
        </Link>
      </div>

      {/* ---------- Two column layout ---------- */}
      <div className={styles.mainGrid}>
        {/* Left column */}
        <div className={styles.leftCol}>
          <Card className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}><FiVideo className={styles.sectionIcon} /> Today's Live Sessions</h3>
              <Link to="/live-sessions" className={styles.viewAllLink}>View all</Link>
            </div>
            {todaysSessions.length === 0 ? (
              <p className={styles.emptyState}>No live sessions scheduled for today.</p>
            ) : (
              <div className={styles.sessionList}>
                {todaysSessions.map((s) => (
                  <div key={s.id} className={styles.sessionRow}>
                    <div className={styles.sessionTimeCol}>
                      {new Date(s.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div className={styles.sessionInfoCol}>
                      <p className={styles.sessionTitleText}>{s.title}</p>
                      <p className={styles.sessionSubText}>{s.course_title} · {s.teacher_name}</p>
                    </div>
                    {s.computed_status === 'live' && <span className={styles.liveTag}>LIVE</span>}
                    {s.computed_status === 'ended' && <span className={styles.endedTag}>Ended</span>}
                    {s.computed_status === 'upcoming' && <span className={styles.upcomingTag}>Upcoming</span>}
                    {s.computed_status === 'cancelled' && <span className={styles.cancelledTag}>Cancelled</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}><FiTrendingUp className={styles.sectionIcon} /> Enrollment Trend</h3>
              <Link to="/reports" className={styles.viewAllLink}>Full report</Link>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#2A5A6D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Recent Registrations</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td><span className={styles.roleBadge}>{user.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          <Card className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}><FiUserPlus className={styles.sectionIcon} /> Pending Teacher Approvals</h3>
            {pendingTeachers.length === 0 ? (
              <p className={styles.emptyState}>No pending approvals.</p>
            ) : (
              <div className={styles.approvalList}>
                {pendingTeachers.map((t) => (
                  <div key={t.id} className={styles.approvalRow}>
                    <div>
                      <p className={styles.approvalName}>{t.full_name}</p>
                      <p className={styles.approvalEmail}>{t.email}</p>
                    </div>
                    <div className={styles.approvalActions}>
                      <button className={styles.approveBtn} onClick={() => handleApprove(t)} title="Approve">
                        <FiCheck size={14} />
                      </button>
                      <button className={styles.rejectBtn} onClick={() => handleReject(t)} title="Reject">
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}><FiActivity className={styles.sectionIcon} /> Recent Activity</h3>
            {activity.length === 0 ? (
              <p className={styles.emptyState}>No recent activity.</p>
            ) : (
              <div className={styles.activityList}>
                {activity.map((a) => (
                  <div key={a.id} className={styles.activityRow}>
                    <div className={styles.activityDot} />
                    <div>
                      <p className={styles.activityText}>
                        <strong>{a.user_name || 'System'}</strong> {a.action?.toLowerCase()}
                      </p>
                      <p className={styles.activityTime}>{timeAgo(a.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;