import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const navItems = {
  CIVILIAN: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/sos', label: 'SOS Alert' },
    { path: '/disaster-info', label: 'Disaster Info' },
    { path: '/donate', label: 'Donate' },
  ],
  RESPONDER: [
    { path: '/responder', label: 'Dashboard' },
    { path: '/responder/map', label: 'Live Map' },
    { path: '/responder/dispatch', label: 'Dispatch' },
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/resources', label: 'Resources' },
    { path: '/admin/users', label: 'Users' },
  ],
  NGO: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/donate', label: 'Donations' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const items = navItems[user?.role] || navItems.CIVILIAN;

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#E24B4A"/>
          <path d="M16 7L20 13H24L20 19H22L16 26L10 19H12L8 13H12L16 7Z"
            fill="white" opacity="0.9"/>
        </svg>
        <span style={styles.logoText}>DisasterGuard</span>
      </div>

      {/* User info */}
      <div style={styles.userInfo}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <div style={styles.userName}>{user?.name || 'User'}</div>
          <div style={styles.userRole}>{user?.role || 'CIVILIAN'}</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={styles.nav}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    background: '#ffffff',
    borderRight: '0.5px solid #e0dfd7',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 20px 20px',
    borderBottom: '0.5px solid #e0dfd7',
  },
  logoText: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a18',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    borderBottom: '0.5px solid #e0dfd7',
    marginBottom: '8px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#E6F1FB',
    color: '#0C447C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '500',
    flexShrink: 0,
  },
  userName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a18',
  },
  userRole: {
    fontSize: '11px',
    color: '#888780',
    marginTop: '2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0 12px',
    flex: 1,
  },
  navItem: {
    padding: '9px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#5F5E5A',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: '#f5f5f0',
    color: '#1a1a18',
    fontWeight: '500',
    borderLeft: '3px solid #E24B4A',
    paddingLeft: '9px',
    borderRadius: '0 8px 8px 0',
  },
  logoutBtn: {
    margin: '12px',
    padding: '9px',
    background: 'transparent',
    border: '0.5px solid #e0dfd7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#888780',
    cursor: 'pointer',
  },
};