import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
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

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Generating reports...</p>;
  if (!data) return <p>Failed to load report data.</p>;

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
  );
}

export default Reports;