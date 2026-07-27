import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import { getRecentLogs } from '../../api/activityLogsApi';
import styles from '../Subjects/Subjects.module.css';
import logStyles from './ActivityLogs.module.css';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getRecentLogs();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div>
      <p className={styles.pageSubtitle}>Last {logs.length} recorded actions</p>

      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : logs.length === 0 ? (
          <p className={logStyles.emptyText}>No activity recorded yet.</p>
        ) : (
          <div className={logStyles.timeline}>
            {logs.map((log) => (
              <div key={log.id} className={logStyles.logRow}>
                <div className={logStyles.logIcon}><FiClock /></div>
                <div className={logStyles.logBody}>
                  <p className={logStyles.logAction}>
                    <strong>{log.user_name || 'Unknown user'}</strong> {log.action.toLowerCase()}
                  </p>
                  {log.details && <p className={logStyles.logDetails}>{log.details}</p>}
                  <p className={logStyles.logTime}>{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default ActivityLogs;