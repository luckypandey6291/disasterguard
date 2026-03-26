import AppLayout from '../../components/Layout/AppLayout';
import useAuthStore from '../../store/authStore';

const sosList = [
  { id: 1, name: 'Rahul Sharma', location: 'Park Street, Kolkata', time: '2 min ago', status: 'PENDING', coords: '22.5514, 88.3527' },
  { id: 2, name: 'Priya Singh', location: 'Salt Lake, Sector 5', time: '8 min ago', status: 'ASSIGNED', coords: '22.5726, 88.4152' },
  { id: 3, name: 'Amit Das', location: 'Howrah Bridge area', time: '15 min ago', status: 'PENDING', coords: '22.5851, 88.3468' },
];

const statusStyle = {
  PENDING: { bg: '#FCEBEB', color: '#A32D2D', label: 'Pending' },
  ASSIGNED: { bg: '#FAEEDA', color: '#633806', label: 'Assigned' },
  RESOLVED: { bg: '#EAF3DE', color: '#27500A', label: 'Resolved' },
};

export default function ResponderDashboard() {
  const { user } = useAuthStore();

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
          { label: 'Pending SOS', value: '3', color: '#E24B4A' },
          { label: 'Assigned to me', value: '1', color: '#EF9F27' },
          { label: 'Resolved today', value: '8', color: '#639922' },
          { label: 'Avg response time', value: '4m', color: '#378ADD' },
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
            <span style={styles.badge}>{sosList.length} active</span>
          </div>

          <div style={styles.sosList}>
            {sosList.map((sos) => {
              const st = statusStyle[sos.status];
              return (
                <div key={sos.id} style={styles.sosItem}>
                  <div style={styles.sosTop}>
                    <div style={styles.sosName}>{sos.name}</div>
                    <span style={{ ...styles.statusBadge, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={styles.sosLocation}>📍 {sos.location}</div>
                  <div style={styles.sosMeta}>
                    <span style={styles.sosCoords}>{sos.coords}</span>
                    <span style={styles.sosTime}>{sos.time}</span>
                  </div>
                  {sos.status === 'PENDING' && (
                    <div style={styles.sosActions}>
                      <button style={styles.acceptBtn}>Accept & Respond</button>
                      <button style={styles.mapBtn}>View on map</button>
                    </div>
                  )}
                  {sos.status === 'ASSIGNED' && (
                    <div style={styles.sosActions}>
                      <button style={styles.resolveBtn}>Mark Resolved</button>
                      <button style={styles.mapBtn}>View on map</button>
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
              { label: 'SOS handled', value: '8' },
              { label: 'Avg response', value: '4 min' },
              { label: 'Distance covered', value: '23 km' },
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
  sosItem: { border: '0.5px solid #e0dfd7', borderRadius: '10px', padding: '14px' },
  sosTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '6px' },
  sosName: { fontSize: '14px', fontWeight: '500', color: '#1a1a18' },
  statusBadge: { fontSize: '11px', padding: '3px 8px',
    borderRadius: '20px', fontWeight: '500' },
  sosLocation: { fontSize: '13px', color: '#5F5E5A', marginBottom: '6px' },
  sosMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  sosCoords: { fontSize: '11px', color: '#B4B2A9', fontFamily: 'monospace' },
  sosTime: { fontSize: '11px', color: '#B4B2A9' },
  sosActions: { display: 'flex', gap: '8px' },
  acceptBtn: { flex: 1, padding: '8px', background: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '12px',
    fontWeight: '500', cursor: 'pointer' },
  resolveBtn: { flex: 1, padding: '8px', background: '#639922', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '12px',
    fontWeight: '500', cursor: 'pointer' },
  mapBtn: { padding: '8px 12px', background: 'transparent',
    border: '0.5px solid #e0dfd7', borderRadius: '6px',
    fontSize: '12px', color: '#888780', cursor: 'pointer' },
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