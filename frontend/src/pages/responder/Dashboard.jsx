import { useEffect, useState } from 'react';
import AppLayout from '../../components/Layout/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const statusStyle = {
  PENDING: { bg: '#FCEBEB', color: '#A32D2D', label: 'Pending' },
  ASSIGNED: { bg: '#FAEEDA', color: '#633806', label: 'Assigned' },
  RESOLVED: { bg: '#EAF3DE', color: '#27500A', label: 'Resolved' },
};

export default function ResponderDashboard() {
  const { user } = useAuthStore();
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSos() {
      try {
        const response = await api.get('/sos/pending');
        setSosList(response.data);
      } catch (err) {
        console.error('Failed to fetch SOS alerts', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSos();
  }, []);

  async function handleAssign(sosId) {
    try {
      await api.put(`/sos/${sosId}/assign`);
      setSosList((prev) =>
        prev.map((s) => s.id === sosId ? { ...s, status: 'ASSIGNED' } : s)
      );
    } catch (err) {
      console.error('Failed to assign SOS', err);
    }
  }

  async function handleResolve(sosId) {
    try {
      await api.put(`/sos/${sosId}/resolve`);
      setSosList((prev) =>
        prev.map((s) => s.id === sosId ? { ...s, status: 'RESOLVED' } : s)
      );
    } catch (err) {
      console.error('Failed to resolve SOS', err);
    }
  }

  return (
    <AppLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Responder Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.name || 'Responder'} — stay alert</p>
        </div>
        <div style={styles.dutyBadge}>
          <span style={styles.dutyDot}></span>
          On duty
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Pending SOS', value: sosList.filter(s => s.status === 'PENDING').length, color: '#E24B4A' },
          { label: 'Assigned', value: sosList.filter(s => s.status === 'ASSIGNED').length, color: '#EF9F27' },
          { label: 'Resolved', value: sosList.filter(s => s.status === 'RESOLVED').length, color: '#639922' },
          { label: 'Total today', value: sosList.length, color: '#378ADD' },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={styles.contentRow}>
        {/* SOS Queue */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Incoming SOS alerts</h2>
            <span style={styles.badge}>
              {sosList.filter(s => s.status === 'PENDING').length} pending
            </span>
          </div>

          <div style={styles.sosList}>
            {/* Loading state */}
            {loading && (
              <div style={styles.emptyText}>Loading SOS alerts...</div>
            )}

            {/* Empty state */}
            {!loading && sosList.length === 0 && (
              <div style={styles.emptyText}>No SOS alerts right now</div>
            )}

            {/* SOS list */}
            {!loading && sosList.map((sos) => {
              const st = statusStyle[sos.status] || statusStyle.PENDING;
              return (
                <div key={sos.id} style={styles.sosItem}>
                  <div style={styles.sosTop}>
                    <div style={styles.sosName}>
                      {sos.user?.name || 'Unknown User'}
                    </div>
                    <span style={{ ...styles.statusBadge,
                      background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>

                  <div style={styles.sosLocation}>
                    📍 {sos.locationName ||
                      `${sos.latitude?.toFixed(4)}, ${sos.longitude?.toFixed(4)}`}
                  </div>

                  <div style={styles.sosMeta}>
                    <span style={styles.sosCoords}>
                      {sos.latitude?.toFixed(6)}, {sos.longitude?.toFixed(6)}
                    </span>
                    <span style={styles.sosTime}>
                      {new Date(sos.triggeredAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={styles.sosType}>
                    Type: {sos.emergencyType || 'GENERAL'}
                  </div>

                  {sos.status === 'PENDING' && (
                    <div style={styles.sosActions}>
                      <button
                        style={styles.acceptBtn}
                        onClick={() => handleAssign(sos.id)}
                      >
                        Accept & Respond
                      </button>
                    </div>
                  )}

                  {sos.status === 'ASSIGNED' && (
                    <div style={styles.sosActions}>
                      <button
                        style={styles.resolveBtn}
                        onClick={() => handleResolve(sos.id)}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  )}

                  {sos.status === 'RESOLVED' && (
                    <div style={styles.resolvedTag}>
                      Resolved
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={styles.rightPanel}>
          {/* My status */}
          <div style={styles.card}>
            <div style={styles.cardLabel}>My status</div>
            <div style={styles.statusRow}>
              <span style={styles.onlineDot}></span>
              <span style={styles.onlineText}>Available</span>
            </div>
            <button style={styles.offDutyBtn}>Go off duty</button>
          </div>

          {/* Quick stats */}
          <div style={styles.card}>
            <div style={styles.cardLabel}>Today's summary</div>
            {[
              { label: 'SOS handled', value: sosList.filter(s => s.status === 'RESOLVED').length },
              { label: 'Pending', value: sosList.filter(s => s.status === 'PENDING').length },
              { label: 'Assigned', value: sosList.filter(s => s.status === 'ASSIGNED').length },
            ].map((item) => (
              <div key={item.label} style={styles.summaryRow}>
                <span style={styles.summaryLabel}>{item.label}</span>
                <span style={styles.summaryValue}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Alert */}
          <div style={styles.alertCard}>
            <div style={styles.alertCardTitle}>Active warning</div>
            <div style={styles.alertCardText}>
              Flood risk in North zone — exercise caution while responding
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#888780' },
  dutyBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
    color: '#639922', background: '#EAF3DE', padding: '6px 12px',
    borderRadius: '20px', border: '0.5px solid #C0DD97' },
  dutyDot: { width: '7px', height: '7px', borderRadius: '50%',
    background: '#639922', display: 'inline-block' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px', marginBottom: '24px' },
  statCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  statLabel: { fontSize: '12px', color: '#888780', marginBottom: '6px' },
  statValue: { fontSize: '26px', fontWeight: '500' },
  contentRow: { display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' },
  section: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center',
    gap: '8px', marginBottom: '16px' },
  sectionTitle: { fontSize: '15px', fontWeight: '500', color: '#1a1a18' },
  badge: { background: '#FCEBEB', color: '#A32D2D', fontSize: '12px',
    padding: '2px 8px', borderRadius: '20px' },
  sosList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  emptyText: { fontSize: '13px', color: '#888780',
    textAlign: 'center', padding: '32px 0' },
  sosItem: { border: '0.5px solid #e0dfd7', borderRadius: '10px', padding: '14px' },
  sosTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '6px' },
  sosName: { fontSize: '14px', fontWeight: '500', color: '#1a1a18' },
  statusBadge: { fontSize: '11px', padding: '3px 8px',
    borderRadius: '20px', fontWeight: '500' },
  sosLocation: { fontSize: '13px', color: '#5F5E5A', marginBottom: '4px' },
  sosMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  sosCoords: { fontSize: '11px', color: '#B4B2A9', fontFamily: 'monospace' },
  sosTime: { fontSize: '11px', color: '#B4B2A9' },
  sosType: { fontSize: '11px', color: '#888780',
    marginBottom: '10px', fontStyle: 'italic' },
  sosActions: { display: 'flex', gap: '8px', marginTop: '8px' },
  acceptBtn: { flex: 1, padding: '8px', background: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '12px',
    fontWeight: '500', cursor: 'pointer' },
  resolveBtn: { flex: 1, padding: '8px', background: '#639922', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '12px',
    fontWeight: '500', cursor: 'pointer' },
  resolvedTag: { fontSize: '12px', color: '#27500A',
    background: '#EAF3DE', padding: '4px 10px',
    borderRadius: '6px', display: 'inline-block', marginTop: '8px' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  cardLabel: { fontSize: '11px', color: '#888780', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: '10px' },
  statusRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  onlineDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#639922' },
  onlineText: { fontSize: '14px', fontWeight: '500', color: '#27500A' },
  offDutyBtn: { width: '100%', padding: '8px', background: 'transparent',
    border: '0.5px solid #e0dfd7', borderRadius: '6px',
    fontSize: '12px', color: '#888780', cursor: 'pointer' },
  summaryRow: { display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '0.5px solid #f5f5f0' },
  summaryLabel: { fontSize: '13px', color: '#888780' },
  summaryValue: { fontSize: '13px', fontWeight: '500', color: '#1a1a18' },
  alertCard: { background: '#FAEEDA', borderRadius: '12px',
    border: '0.5px solid #FAC775', padding: '16px' },
  alertCardTitle: { fontSize: '12px', fontWeight: '500',
    color: '#633806', marginBottom: '6px' },
  alertCardText: { fontSize: '12px', color: '#854F0B', lineHeight: '1.5' },
};