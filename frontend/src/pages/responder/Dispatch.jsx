import { useEffect, useState } from 'react';
import AppLayout from '../../components/Layout/AppLayout';
import api from '../../services/api';

const statusStyle = {
  PENDING: { bg: '#FCEBEB', color: '#A32D2D', label: 'Pending' },
  ASSIGNED: { bg: '#FAEEDA', color: '#633806', label: 'Assigned' },
  RESOLVED: { bg: '#EAF3DE', color: '#27500A', label: 'Resolved' },
};

export default function Dispatch() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get('/sos/pending');
        setSosList(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  async function handleAssign(id) {
    try {
      await api.put(`/sos/${id}/assign`);
      setSosList((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: 'ASSIGNED' } : s)
      );
    } catch (err) { console.error(err); }
  }

  async function handleResolve(id) {
    try {
      await api.put(`/sos/${id}/resolve`);
      setSosList((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: 'RESOLVED' } : s)
      );
    } catch (err) { console.error(err); }
  }

  const filtered = filter === 'ALL'
    ? sosList
    : sosList.filter((s) => s.status === filter);

  return (
    <AppLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dispatch center</h1>
          <p style={styles.subtitle}>Manage and respond to SOS alerts</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total SOS', value: sosList.length, color: '#378ADD' },
          { label: 'Pending', value: sosList.filter(s => s.status === 'PENDING').length, color: '#E24B4A' },
          { label: 'Assigned', value: sosList.filter(s => s.status === 'ASSIGNED').length, color: '#EF9F27' },
          { label: 'Resolved', value: sosList.filter(s => s.status === 'RESOLVED').length, color: '#639922' },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['ALL', 'PENDING', 'ASSIGNED', 'RESOLVED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              background: filter === f ? '#1a1a18' : 'transparent',
              color: filter === f ? '#ffffff' : '#888780',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SOS list */}
      <div style={styles.section}>
        {loading && (
          <div style={styles.empty}>Loading dispatch queue...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={styles.empty}>No SOS alerts in this category</div>
        )}
        {!loading && filtered.map((sos) => {
          const st = statusStyle[sos.status] || statusStyle.PENDING;
          return (
            <div key={sos.id} style={styles.sosCard}>
              <div style={styles.sosTop}>
                <div style={styles.sosLeft}>
                  <div style={styles.sosName}>
                    {sos.user?.name || 'Unknown User'}
                  </div>
                  <div style={styles.sosEmail}>
                    {sos.user?.email || ''}
                  </div>
                </div>
                <span style={{ ...styles.badge, background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>

              <div style={styles.sosInfo}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Location</span>
                  <span style={styles.infoVal}>
                    {sos.locationName ||
                      `${sos.latitude?.toFixed(4)}, ${sos.longitude?.toFixed(4)}`}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Coordinates</span>
                  <span style={{ ...styles.infoVal, fontFamily: 'monospace', fontSize: '11px' }}>
                    {sos.latitude?.toFixed(6)}, {sos.longitude?.toFixed(6)}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Type</span>
                  <span style={styles.infoVal}>{sos.emergencyType || 'GENERAL'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Time</span>
                  <span style={styles.infoVal}>
                    {new Date(sos.triggeredAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={styles.actions}>
                {sos.status === 'PENDING' && (
                  <button style={styles.acceptBtn} onClick={() => handleAssign(sos.id)}>
                    Accept & Dispatch
                  </button>
                )}
                {sos.status === 'ASSIGNED' && (
                  <button style={styles.resolveBtn} onClick={() => handleResolve(sos.id)}>
                    Mark as Resolved
                  </button>
                )}
                {sos.status === 'RESOLVED' && (
                  <span style={styles.resolvedTag}>Completed</span>
                )}
                <a
                  href={`https://maps.google.com/?q=${sos.latitude},${sos.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.mapLink}
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#888780' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px', marginBottom: '20px' },
  statCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  statLabel: { fontSize: '12px', color: '#888780', marginBottom: '6px' },
  statVal: { fontSize: '26px', fontWeight: '500' },
  filterRow: { display: 'flex', gap: '8px', marginBottom: '16px',
    background: '#ffffff', padding: '6px', borderRadius: '10px',
    border: '0.5px solid #e0dfd7', width: 'fit-content' },
  filterBtn: { padding: '6px 16px', borderRadius: '7px', border: 'none',
    fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  empty: { textAlign: 'center', padding: '40px', color: '#888780',
    fontSize: '13px', background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7' },
  sosCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  sosTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '12px' },
  sosLeft: {},
  sosName: { fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '2px' },
  sosEmail: { fontSize: '12px', color: '#888780' },
  badge: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  sosInfo: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px', marginBottom: '14px', background: '#f5f5f0',
    borderRadius: '8px', padding: '12px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '11px', color: '#888780' },
  infoVal: { fontSize: '12px', color: '#1a1a18', fontWeight: '500' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  acceptBtn: { padding: '8px 16px', background: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '7px', fontSize: '12px',
    fontWeight: '500', cursor: 'pointer' },
  resolveBtn: { padding: '8px 16px', background: '#639922', color: '#fff',
    border: 'none', borderRadius: '7px', fontSize: '12px',
    fontWeight: '500', cursor: 'pointer' },
  resolvedTag: { fontSize: '12px', color: '#27500A', background: '#EAF3DE',
    padding: '6px 12px', borderRadius: '7px' },
  mapLink: { fontSize: '12px', color: '#378ADD', textDecoration: 'none',
    padding: '7px 12px', border: '0.5px solid #B5D4F4',
    borderRadius: '7px', marginLeft: 'auto' },
};