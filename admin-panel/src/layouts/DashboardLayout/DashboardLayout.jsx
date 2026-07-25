import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { menuItems } from '../../constants/menuItems';
import { usePageTitle } from '../../context/PageTitleContext';
import { useEffect } from 'react';
import styles from './DashboardLayout.module.css';

function getStaticTitle(pathname) {
  for (const section of menuItems) {
    const match = section.items.find((item) => item.path === pathname);
    if (match) return match.label;
  }
  return 'Dashboard';
}

function DashboardLayout() {
  const location = useLocation();
  const { pageTitle, setPageTitle } = usePageTitle();
  const staticTitle = getStaticTitle(location.pathname);

  useEffect(() => {
    setPageTitle('');
  }, [location.pathname]);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainArea}>
        <Topbar title={pageTitle || staticTitle} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;