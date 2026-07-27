import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBell, FiSun, FiMoon, FiChevronDown, FiUser, FiSettings, FiLogOut, FiClock } from 'react-icons/fi';
import { getUser, logout } from '../../utils/auth';
import { getFileUrl } from '../../utils/urls';
import { getRecentLogs } from '../../api/activityLogsApi';
import styles from './DashboardLayout.module.css';
import { getNotificationLogs } from '../../api/activityLogsApi';

const LAST_SEEN_KEY = 'notifications_last_seen';

function Topbar({ title }) {
  const navigate = useNavigate();
  const user = getUser();

  const [notifOpen, setNotifOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  async function loadNotifications() {
    s
    setLoadingLogs(true);
    try {
      const data = await getNotificationLogs();
      setLogs(data.slice(0, 8));

      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
      const unseen = data.filter((log) => new Date(log.created_at).getTime() > lastSeenTime).length;
      setUnseenCount(unseen);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  function handleBellClick() {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      setUnseenCount(0);
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>{title}</h1>

      <div className={styles.topbarActions}>
        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>

        <div className={styles.notifWrapper} ref={notifRef}>
          <button className={styles.iconBtn} onClick={handleBellClick} title="Notifications">
            <FiBell />
            {unseenCount > 0 && (
              <span className={styles.notifBadge}>{unseenCount > 9 ? '9+' : unseenCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span>Recent Activity</span>
                <Link to="/activity-logs" className={styles.viewAllLink} onClick={() => setNotifOpen(false)}>
                  View all
                </Link>
              </div>
              {loadingLogs ? (
                <p className={styles.notifStatus}>Loading...</p>
              ) : logs.length === 0 ? (
                <p className={styles.notifStatus}>No recent activity.</p>
              ) : (
                <div className={styles.notifList}>
                  {logs.map((log) => (
                    <div key={log.id} className={styles.notifItem}>
                      <div className={styles.notifIcon}><FiClock /></div>
                      <div className={styles.notifBody}>
                        <p className={styles.notifText}>
                          <strong>{log.user_name || 'Unknown user'}</strong> {log.action.toLowerCase()}
                        </p>
                        <span className={styles.notifTime}>{timeAgo(log.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.userMenuWrapper} ref={userMenuRef}>
          <button className={styles.userMenuTrigger} onClick={() => setUserMenuOpen((o) => !o)}>
            {user?.profile_picture ? (
              <img src={getFileUrl(user.profile_picture)} alt="" className={styles.userMenuAvatar} />
            ) : (
              <div className={styles.userMenuAvatarFallback}>{user?.full_name?.charAt(0) || 'A'}</div>
            )}
            <span className={styles.userMenuName}>{user?.full_name?.split(' ')[0]}</span>
            <FiChevronDown className={styles.chevron} />
          </button>

          {userMenuOpen && (
            <div className={styles.userDropdown}>
              <Link to="/profile" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                <FiUser /> My Profile
              </Link>
              <Link to="/settings" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                <FiSettings /> Settings
              </Link>
              <button className={`${styles.userDropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <FiLogOut /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;