import { useState, useEffect } from 'react';
import { FiSun, FiBell, FiGlobe, FiSidebar, FiInfo } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import styles from './Settings.module.css';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={checked ? `${styles.switch} ${styles.switchOn}` : styles.switch}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}

function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [emailNotifs, setEmailNotifs] = useState(localStorage.getItem('pref_email_notifs') !== 'false');
  const [compactSidebar, setCompactSidebar] = useState(localStorage.getItem('pref_compact_sidebar') === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pref_email_notifs', emailNotifs);
  }, [emailNotifs]);

  useEffect(() => {
    localStorage.setItem('pref_compact_sidebar', compactSidebar);
  }, [compactSidebar]);

  return (
    <div className={styles.wrapper}>
      <Card>
        <h3 className={styles.sectionTitle}><FiSun /> Appearance</h3>
        <div className={styles.settingRow}>
          <div>
            <p className={styles.settingLabel}>Theme</p>
            <p className={styles.settingDesc}>Choose light or dark mode for the Admin Panel</p>
          </div>
          <div className={styles.toggleGroup}>
            <button
              className={theme === 'light' ? `${styles.toggleBtn} ${styles.toggleActive}` : styles.toggleBtn}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              className={theme === 'dark' ? `${styles.toggleBtn} ${styles.toggleActive}` : styles.toggleBtn}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
          </div>
        </div>

        <div className={styles.settingRow}>
          <div>
            <p className={styles.settingLabel}>Compact Sidebar</p>
            <p className={styles.settingDesc}>Icon-only sidebar to save screen space (coming soon)</p>
          </div>
          <Toggle checked={compactSidebar} onChange={setCompactSidebar} />
        </div>
      </Card>

      <Card>
        <h3 className={styles.sectionTitle}><FiBell /> Notifications</h3>
        <div className={styles.settingRow}>
          <div>
            <p className={styles.settingLabel}>Email Notifications</p>
            <p className={styles.settingDesc}>Get emailed about new enrollments and course activity (coming soon — no email service connected yet)</p>
          </div>
          <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
        </div>
      </Card>

      <Card>
        <h3 className={styles.sectionTitle}><FiGlobe /> Language & Region</h3>
        <div className={styles.settingRow}>
          <div>
            <p className={styles.settingLabel}>Interface Language</p>
            <p className={styles.settingDesc}>English (more languages, including Arabic, coming soon)</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className={styles.sectionTitle}><FiInfo /> About</h3>
        <div className={styles.aboutRow}>
          <span className={styles.settingLabel}>DeenConnect Admin Panel</span>
          <span className={styles.versionTag}>v1.0.0</span>
        </div>
      </Card>
    </div>
  );
}

export default Settings;