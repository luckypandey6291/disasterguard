import AppLayout from '../../components/Layout/AppLayout';

const resources = [
  { name: 'Food packets', total: 500, available: 320, unit: 'packs' },
  { name: 'Water bottles', total: 1000, available: 680, unit: 'bottles' },
  { name: 'Medical kits', total: 200, available: 85, unit: 'kits' },
  { name: 'Rescue boats', total: 20, available: 12, unit: 'boats' },
];

const recentUsers = [
  { name: 'Lucky Pandey', email: 'lucky@test.com', role: 'CIVILIAN', status: 'Active' },
  { name: 'Raj Kumar', email: 'raj@test.com', role: 'RESPONDER', status: 'On duty' },
  { name: 'Priya NGO', email: 'priya@ngo.com', role: 'NGO', status: 'Active' },
];

const roleColors = {
  CIVILIAN: { bg: '#E6F1FB', color: '#0C447C' },
  RESPONDER: { bg: '#FCEBEB', color: '#A32D2D' },
  NGO: { bg: '#EEEDFE', color: '#3C3489' },
  ADMIN: { bg: '#EAF3DE', color: '#27500A' },
};

export default function AdminDashboard() {
  return (
    <AppLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>System overview — all regions</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total users', value: '1,240', color: '#378ADD' },
          { label: 'Active incidents', value: '7', color: '#E24B4A' },
          { label: 'SOS today', value: '14', color: '#EF9F27' },
          { label: 'Resources used', value: '32%', color: '#639922' },
          { label: 'Responders active', value: '12', color: '#7F77DD' },
          { label: 'Donations today', value: '₹24K', color: '#1D9E75' },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={styles.contentRow}>
        {/* Resources */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Resource inventory</h2>
          <div style={styles.resourceList}>
            {resources.map((r) => {
              const pct = Math.round((r.available / r.total) * 100);
              const barColor = pct > 50 ? '#639922' : pct > 25 ? '#EF9F27' : '#E24B4A';
              return (
                <div key={r.name} style={styles.resourceItem}>
                  <div style={styles.resourceTop}>
                    <span style={styles.resourceName}>{r.name}</span>
                    <span style={styles.resourceCount}>
                      {r.available} / {r.total} {r.unit}
                    </span>
                  </div>
                  <div style={styles.progressBg}>
                    <div style={{ ...styles.progressFill,
                      width: `${pct}%`, background: barColor }} />
                  </div>
                  <div style={styles.resourcePct}>{pct}% available</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent users</h2>
          <div style={styles.userList}>
            {recentUsers.map((u) => {
              const rc = roleColors[u.role];
              return (
                <div key={u.email} style={styles.userItem}>
                  <div style={styles.userAvatar}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.userName}>{u.name}</div>
                    <div style={styles.userEmail}>{u.email}</div>
                  </div>
                  <span style={{ ...styles.roleBadge,
                    background: rc.bg, color: rc.color }}>
                    {u.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#888780' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', marginBottom: '24px' },
  statCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  statLabel: { fontSize: '12px', color: '#888780', marginBottom: '6px' },
  statValue: { fontSize: '26px', fontWeight: '500' },
  contentRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  section: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '20px' },
  sectionTitle: { fontSize: '15px', fontWeight: '500',
    color: '#1a1a18', marginBottom: '16px' },
  resourceList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  resourceItem: {},
  resourceTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  resourceName: { fontSize: '13px', fontWeight: '500', color: '#1a1a18' },
  resourceCount: { fontSize: '12px', color: '#888780' },
  progressBg: { height: '6px', background: '#f5f5f0',
    borderRadius: '3px', marginBottom: '4px' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  resourcePct: { fontSize: '11px', color: '#B4B2A9', textAlign: 'right' },
  userList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  userItem: { display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', background: '#f5f5f0', borderRadius: '8px' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '50%',
    background: '#E6F1FB', color: '#0C447C', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '500', flexShrink: 0 },
  userName: { fontSize: '13px', fontWeight: '500', color: '#1a1a18' },
  userEmail: { fontSize: '11px', color: '#888780' },
  roleBadge: { fontSize: '10px', padding: '3px 7px',
    borderRadius: '20px', fontWeight: '500', flexShrink: 0 },
};