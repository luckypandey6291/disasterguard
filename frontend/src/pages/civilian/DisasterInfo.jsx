import { useEffect, useState } from 'react';
import AppLayout from '../../components/Layout/AppLayout';
import api from '../../services/api';

const tips = {
  FLOOD: [
    'Move to higher ground immediately',
    'Avoid walking in moving water',
    'Do not drive through flooded roads',
    'Turn off utilities at main switches',
    'Disconnect electrical appliances',
  ],
  CYCLONE: [
    'Stay indoors away from windows',
    'Stock up on food and water for 3 days',
    'Keep emergency contacts ready',
    'Secure loose objects outside',
    'Follow evacuation orders immediately',
  ],
  EARTHQUAKE: [
    'Drop, cover and hold on',
    'Stay away from windows and heavy furniture',
    'If outdoors, move away from buildings',
    'After shaking stops, check for injuries',
    'Expect aftershocks',
  ],
  GENERAL: [
    'Keep emergency kit ready',
    'Know your evacuation routes',
    'Keep phone charged at all times',
    'Follow official announcements',
    'Help elderly and disabled neighbors',
  ],
};

const severityColors = {
  CRITICAL: { bg: '#FCEBEB', color: '#A32D2D', dot: '#E24B4A' },
  HIGH: { bg: '#FCEBEB', color: '#A32D2D', dot: '#E24B4A' },
  MEDIUM: { bg: '#FAEEDA', color: '#633806', dot: '#EF9F27' },
  LOW: { bg: '#EAF3DE', color: '#27500A', dot: '#639922' },
};

export default function DisasterInfo() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get('/incidents/active');
        setIncidents(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const selectedTips = tips[selected?.type] || tips.GENERAL;

  return (
    <AppLayout>
      <div style={styles.header}>
        <h1 style={styles.title}>Disaster information</h1>
        <p style={styles.subtitle}>
          Active alerts and safety guidance for your region
        </p>
      </div>

      {loading && (
        <div style={styles.empty}>Loading disaster information...</div>
      )}

      {!loading && incidents.length === 0 && (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>✓</div>
          <div style={styles.emptyTitle}>No active disasters</div>
          <div style={styles.emptySub}>
            Your region is currently safe. Stay prepared.
          </div>
        </div>
      )}

      {!loading && incidents.length > 0 && (
        <div style={styles.grid}>
          {/* Left — incident list */}
          <div style={styles.list}>
            <div style={styles.sectionTitle}>Active incidents</div>
            {incidents.map((inc) => {
              const s = severityColors[inc.severity] || severityColors.LOW;
              const isSelected = selected?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelected(inc)}
                  style={{
                    ...styles.incidentItem,
                    border: isSelected
                      ? '1.5px solid #E24B4A'
                      : '0.5px solid #e0dfd7',
                    background: isSelected ? '#FCEBEB' : '#ffffff',
                  }}
                >
                  <div style={styles.incidentTop}>
                    <span style={{ ...styles.dot, background: s.dot }} />
                    <span style={styles.incidentTitle}>{inc.title}</span>
                  </div>
                  <div style={styles.incidentMeta}>
                    <span style={styles.incidentLocation}>
                      📍 {inc.locationName || 'Unknown'}
                    </span>
                    <span style={{
                      ...styles.severityBadge,
                      background: s.bg,
                      color: s.color,
                    }}>
                      {inc.severity}
                    </span>
                  </div>
                  {inc.aiConfidence && (
                    <div style={styles.confidence}>
                      AI confidence: {Math.round(inc.aiConfidence * 100)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right — detail + tips */}
          {selected && (
            <div style={styles.detail}>
              {/* Incident detail */}
              <div style={styles.detailCard}>
                <div style={styles.detailTitle}>{selected.title}</div>
                <div style={styles.detailMeta}>
                  <span>📍 {selected.locationName || 'Unknown location'}</span>
                  <span>🕐 {new Date(selected.occurredAt).toLocaleString()}</span>
                </div>
                {selected.description && (
                  <div style={styles.description}>{selected.description}</div>
                )}
                <div style={styles.statsRow}>
                  <div style={styles.statItem}>
                    <div style={styles.statLabel}>Type</div>
                    <div style={styles.statVal}>{selected.type || 'General'}</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statLabel}>Severity</div>
                    <div style={{ ...styles.statVal, color: '#E24B4A' }}>
                      {selected.severity}
                    </div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statLabel}>Status</div>
                    <div style={{ ...styles.statVal, color: '#639922' }}>
                      {selected.status}
                    </div>
                  </div>
                  {selected.aiConfidence && (
                    <div style={styles.statItem}>
                      <div style={styles.statLabel}>AI confidence</div>
                      <div style={styles.statVal}>
                        {Math.round(selected.aiConfidence * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety tips */}
              <div style={styles.tipsCard}>
                <div style={styles.tipsTitle}>Safety tips</div>
                {selectedTips.map((tip, i) => (
                  <div key={i} style={styles.tipRow}>
                    <span style={styles.tipNum}>{i + 1}</span>
                    <span style={styles.tipText}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Emergency contacts */}
              <div style={styles.contactsCard}>
                <div style={styles.tipsTitle}>Emergency contacts</div>
                <div style={styles.contactsGrid}>
                  {[
                    { label: 'Police', number: '100' },
                    { label: 'Ambulance', number: '108' },
                    { label: 'Fire', number: '101' },
                    { label: 'Disaster helpline', number: '1078' },
                  ].map((c) => (
                    <a key={c.label} href={`tel:${c.number}`}
                      style={styles.contactItem}>
                      <div style={styles.contactNum}>{c.number}</div>
                      <div style={styles.contactLabel}>{c.label}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' },
  subtitle: { fontSize: '14px', color: '#888780' },
  empty: { fontSize: '13px', color: '#888780', textAlign: 'center', padding: '40px' },
  emptyCard: { background: '#ffffff', borderRadius: '12px', border: '0.5px solid #e0dfd7',
    padding: '48px', textAlign: 'center' },
  emptyIcon: { fontSize: '40px', color: '#639922', marginBottom: '12px' },
  emptyTitle: { fontSize: '18px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' },
  emptySub: { fontSize: '14px', color: '#888780' },
  grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px',
    alignItems: 'start' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionTitle: { fontSize: '13px', fontWeight: '500', color: '#888780',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  incidentItem: { borderRadius: '10px', padding: '12px', cursor: 'pointer',
    transition: 'all 0.15s' },
  incidentTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  incidentTitle: { fontSize: '13px', fontWeight: '500', color: '#1a1a18' },
  incidentMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  incidentLocation: { fontSize: '11px', color: '#888780' },
  severityBadge: { fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
    fontWeight: '500' },
  confidence: { fontSize: '11px', color: '#888780', marginTop: '4px' },
  detail: { display: 'flex', flexDirection: 'column', gap: '14px' },
  detailCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '20px' },
  detailTitle: { fontSize: '18px', fontWeight: '500', color: '#1a1a18', marginBottom: '10px' },
  detailMeta: { display: 'flex', gap: '16px', fontSize: '12px',
    color: '#888780', marginBottom: '12px', flexWrap: 'wrap' },
  description: { fontSize: '13px', color: '#5F5E5A', lineHeight: '1.6',
    marginBottom: '16px', padding: '12px', background: '#f5f5f0', borderRadius: '8px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  statItem: { textAlign: 'center', padding: '10px', background: '#f5f5f0',
    borderRadius: '8px' },
  statLabel: { fontSize: '11px', color: '#888780', marginBottom: '4px' },
  statVal: { fontSize: '14px', fontWeight: '500', color: '#1a1a18' },
  tipsCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '20px' },
  tipsTitle: { fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '14px' },
  tipRow: { display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' },
  tipNum: { width: '22px', height: '22px', borderRadius: '50%', background: '#E6F1FB',
    color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '500', flexShrink: 0 },
  tipText: { fontSize: '13px', color: '#5F5E5A', lineHeight: '1.5', paddingTop: '2px' },
  contactsCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '20px' },
  contactsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  contactItem: { textAlign: 'center', padding: '12px', background: '#f5f5f0',
    borderRadius: '8px', textDecoration: 'none', border: '0.5px solid #e0dfd7' },
  contactNum: { fontSize: '18px', fontWeight: '500', color: '#E24B4A', marginBottom: '4px' },
  contactLabel: { fontSize: '11px', color: '#888780' },
};