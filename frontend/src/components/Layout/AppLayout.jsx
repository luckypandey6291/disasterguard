import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import NotificationCenter from '../Notification/NotificationCenter';
import useFCM from '../../hooks/useFCM';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  // Initialize FCM push notification listener
  useFCM();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.wrapper}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile top bar */}
      {isMobile && (
        <div style={styles.mobileTopBar}>
          <div style={styles.mobileLogo}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#E24B4A"/>
              <path d="M16 7L20 13H24L20 19H22L16 26L10 19H12L8 13H12L16 7Z"
                fill="white" opacity="0.9"/>
            </svg>
            <span style={styles.mobileLogoText}>DisasterGuard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationCenter />
            <button
              style={styles.menuBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={styles.mobileSidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{
        ...styles.main,
        paddingTop: isMobile ? '72px' : '28px',
        paddingLeft: isMobile ? '16px' : '28px',
        paddingRight: isMobile ? '16px' : '28px',
        paddingBottom: isMobile ? '16px' : '28px',
      }}>
        {!isMobile && (
          <div style={styles.desktopTopBar}>
            <NotificationCenter />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f5f0',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
  },
  desktopTopBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  mobileTopBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '56px',
    background: '#ffffff',
    borderBottom: '0.5px solid #e0dfd7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 100,
  },
  mobileLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  mobileLogoText: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a18',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#1a1a18',
    padding: '8px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
  },
  mobileSidebar: {
    width: '260px',
    background: '#ffffff',
    height: '100vh',
    overflowY: 'auto',
    zIndex: 1001,
  },
};