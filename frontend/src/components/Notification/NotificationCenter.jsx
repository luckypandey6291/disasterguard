import { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function NotificationCenter() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function fetchNotifications() {
      try {
        const res = await api.get('/api/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.warn('Failed to fetch notifications:', err);
      }
    }
    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  async function handleMarkRead(id) {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  }

  return (
    <div style={styles.wrapper}>
      <button
        onClick={() => setOpen(!open)}
        style={styles.bellBtn}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span style={styles.dropdownTitle}>Notifications</span>
            <span style={styles.unreadTag}>{unreadCount} unread</span>
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  style={{
                    ...styles.item,
                    background: n.readStatus ? '#ffffff' : '#F4F7FB',
                  }}
                >
                  <div style={styles.itemTitle}>
                    {!n.readStatus && <span style={styles.unreadDot} />}
                    {n.title}
                  </div>
                  <div style={styles.itemBody}>{n.message}</div>
                  <div style={styles.itemTime}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  bellBtn: {
    background: '#F5F5F0',
    border: '1px solid #E0DFD7',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#E24B4A',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '10px',
    padding: '2px 5px',
    lineHeight: '1',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '46px',
    width: '320px',
    maxHeight: '400px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #E0DFD7',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #EDEDE8',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F9F9F6',
  },
  dropdownTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A1A18',
  },
  unreadTag: {
    fontSize: '11px',
    color: '#E24B4A',
    fontWeight: '500',
  },
  list: {
    overflowY: 'auto',
    maxHeight: '340px',
  },
  empty: {
    padding: '24px',
    textAlign: 'center',
    color: '#888880',
    fontSize: '13px',
  },
  item: {
    padding: '12px 16px',
    borderBottom: '1px solid #F0F0EC',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1A1A18',
    marginBottom: '3px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  unreadDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#E24B4A',
    display: 'inline-block',
  },
  itemBody: {
    fontSize: '12px',
    color: '#555550',
    lineHeight: '1.4',
    marginBottom: '4px',
  },
  itemTime: {
    fontSize: '10px',
    color: '#999990',
  },
};
