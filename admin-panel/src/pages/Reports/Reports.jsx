import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { FiUsers, FiUserCheck, FiBookOpen, FiCheckCircle, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import { getReportSummary } from '../../api/reportsApi';
import styles from './Reports.module.css';

const STATUS_COLORS = {
  active: '#2A5A6D',
  completed: '#2E7D32',
  dropped: '#D32F2F',
  present: '#2E7D32',
  late: '#ED6C02',
  absent: '#D32F2F',
  excused: '#5D8494',
};

const AUTO_REFRESH_MS = 60000; // re-fetch every 60s so numbers stay current without a manual reload

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadReport = useCallback(() => {
    getReportSummary()
      .then((result) => {
        setData(result);
        setLastUpdated(new Date());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReport();
    const interval = setInterval(loadReport, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadReport]);

  if (loading) return <p>Generating reports...</p>;
  if (!data) return <p>Failed to load report data.</p>;

  const { kpiSummary, monthlyReport, completedCourses } = data;

  const enrollmentPieData = data.enrollmentsByStatus.map((e) => ({
    name: e.status,
    value: Number(e.count),
  }));

  const attendancePieData = data.attendanceSummary.map((a) => ({
    name: a.status,
    value: Number(a.count),
  }));

  const topCoursesData = data.topCourses.map((c) => ({
    name: c.title.length > 18 ? c.title.slice(0, 18) + '…' : c.title,
    enrollments: Number(c.enrollment_count),
  }));

  const trendData = data.enrollmentsOverTime.map((t) => ({
    month: t.month,
    enrollments: Number(t.count),
  }));

  return (
    <div>
      {/* ---------- Header + live refresh indicator ---------- */}
      <div className={styles.reportsHeader}>
        <p className={styles.updatedNote}>
          <FiRefreshCw className={styles.refreshIcon} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · auto-refreshes every minute` : ''}
        </p>
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrap}><FiUsers /></div>
          <div>
            <p className={styles.kpiValue}>{kpiSummary.total_students}</p>
            <p className={styles.kpiLabel}>Total Students</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrap}><FiUserCheck /></div>
          <div>
            <p className={styles.kpiValue}>{kpiSummary.total_teachers}</p>
            <p className={styles.kpiLabel}>Total Teachers</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrap}><FiBookOpen /></div>
          <div>
            <p className={styles.kpiValue}>{kpiSummary.total_courses}</p>
            <p className={styles.kpiLabel}>Active Courses</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrap}><FiTrendingUp /></div>
          <div>
            <p className={styles.kpiValue}>{kpiSummary.active_enrollments}</p>
            <p className={styles.kpiLabel}>Active Enrollments</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrap}><FiCheckCircle /></div>
          <div>
            <p className={styles.kpiValue}>
              {kpiSummary.overall_attendance_rate === null ? '—' : `${kpiSummary.overall_attendance_rate}%`}
            </p>
            <p className={styles.kpiLabel}>Overall Attendance</p>
          </div>
        </div>
      </div>

      {/* ---------- This Month ---------- */}
      <h3 className={styles.sectionTitle}>This Month — {monthlyReport.month_label}</h3>
      <div className={styles.monthRow}>
        <div className={styles.monthCard}>
          <p className={styles.monthValue}>{monthlyReport.new_enrollments}</p>
          <p className={styles.monthLabel}>New Enrollments</p>
        </div>
        <div className={styles.monthCard}>
          <p className={styles.monthValue}>{monthlyReport.sessions_held}</p>
          <p className={styles.monthLabel}>Live Sessions Scheduled</p>
        </div>
        <div className={styles.monthCard}>
          <p className={styles.monthValue}>
            {monthlyReport.attendance_rate === null ? '—' : `${monthlyReport.attendance_rate}%`}
          </p>
          <p className={styles.monthLabel}>Attendance Rate This Month</p>
        </div>
      </div>

      {/* ---------- Charts ---------- */}
      <h3 className={styles.sectionTitle}>Trends & Breakdown</h3>
      <div className={styles.grid}>
        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top 5 Courses by Enrollment</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCoursesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#2A5A6D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Enrollments by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={enrollmentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {enrollmentPieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#8FB7C2'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Attendance Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={attendancePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {attendancePieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#8FB7C2'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCardWide}>
          <h3 className={styles.chartTitle}>Enrollment Trend (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="enrollments" stroke="#2A5A6D" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ---------- Completed Courses Report (at the end) ---------- */}
      <h3 className={styles.sectionTitle}>Completed Courses</h3>
      <Card>
        {completedCourses.length === 0 ? (
          <p className={styles.emptyState}>No completed courses yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Completed On</th>
                </tr>
              </thead>
              <tbody>
                {completedCourses.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className={styles.studentCell}>
                        <span>{row.student_name}</span>
                        <span className={styles.studentEmail}>{row.student_email}</span>
                      </div>
                    </td>
                    <td>{row.course_title}</td>
                    <td>{row.subject_name}</td>
                    <td>{row.teacher_name}</td>
                    <td>
                      {row.completed_on
                        ? new Date(row.completed_on).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
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

export default Reports;