import styles from './DashboardLayout.module.css';

function Topbar({ title }) {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <div className={styles.topbarActions}>
        <input type="text" placeholder="Search..." className={styles.searchInput} />
      </div>
    </header>
  );
}

export default Topbar;