

import { NavLink, useNavigate } from 'react-router-dom';
import { menuItems } from '../../constants/menuItems';
import { logout, getUser } from '../../utils/auth';
import styles from './DashboardLayout.module.css';
import { getFileUrl } from '../../utils/urls';
import logo from '../../assets/logo.png';

function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
  <img 
    src={logo} // Replace with your image source or variable
    alt="DeenConnect Logo" 
    className={styles.logoImage} 
  />
  <span className={styles.logoText}>DeenConnect</span>
</div>

      <nav className={styles.nav}>
        {menuItems.map((section) => (
          <div key={section.section} className={styles.navSection}>
            <span className={styles.sectionLabel}>{section.section}</span>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                  }
                >
                  <Icon className={styles.navIcon} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.profile_picture ? (
              <img src={getFileUrl(user.profile_picture)} alt={user.full_name} className={styles.userAvatarImg} />
            ) : (
              user?.full_name?.charAt(0) || 'A'
            )}
          </div>
          <div>
            <p className={styles.userName}>{user?.full_name || 'Admin'}</p>
            <p className={styles.userRole}>{user?.role || 'admin'}</p>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>⏻</button>
      </div>
    </aside>
  );
}

export default Sidebar;