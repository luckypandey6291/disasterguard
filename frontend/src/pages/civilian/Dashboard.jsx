import { useEffect, useState } from 'react';
import AppLayout from '../../components/Layout/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import useWebSocket from '../../hooks/useWebSocket';
import DisasterMap from '../../components/Map/DisasterMap';

const severityColors = {
  CRITICAL: { dot: '#E24B4A', bg: '#FCEBEB', color: '#A32D2D' },
  HIGH:     { dot: '#E24B4A', bg: '#FCEBEB', color: '#A32D2D' },
  MEDIUM:   { dot: '#EF9F27', bg: '#FAEEDA', color: '#633806' },
  LOW:      { dot: '#639922', bg: '#EAF3DE', color: '#27500A' },
};

export default function CivilianDashboard() {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const response = await api.get('/incidents/active');
        setIncidents(response.data);
      } catch (err) {
        console.error('Failed to fetch incidents', err);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
  }, []);

  const [sosAlerts, setSosAlerts] = useState([]);

useEffect(() => {
  async function fetchData() {
    try {
      const [incidentRes, sosRes] = await Promise.all([
        api.get('/incidents/active'),
        api.get('/sos/pending'),
      ]);
      setIncidents(incidentRes.data);
      setSosAlerts(sosRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);

  // Real-time new incidents
  useWebSocket(
    null,
    null,
    (newIncident) => {
      setIncidents((prev) => [newIncident, ...prev]);
    }
  );

  const stats = [
    { label: 'Active incidents', value: incidents.length, color: '#E24B4A', sub: 'In your region' },
    { label: 'Critical alerts', value: incidents.filter(i => i.severity === 'CRITICAL').length, color: '#1a1a18', sub: 'Immediate danger' },
    { label: 'Responders on duty', value: '12', color: '#639922', sub: 'Available now' },
    { label: 'Resources available', value: '68%', color: '#EF9F27', sub: 'Food + medical' },
  ];

  return (
    <AppLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {user?.name || 'User'} 👋</h1>
          <p style={styles.subtitle}>Here's what's happening in your region right now</p>
        </div>
        <div style={styles.liveBadge}>
          <span style={styles.liveDot}></span>
          Live
        </div>
      </div>

      <div style={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
            <div style={styles.statSub}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Live Map */}
<div style={styles.mapSection}>
  <div style={styles.sectionHeader}>
    <h2 style={styles.sectionTitle}>Live disaster map</h2>
    <span style={{ fontSize: '12px', color: '#888780' }}>
      {incidents.length} incidents plotted
    </span>
  </div>
  <DisasterMap incidents={incidents} height="320px" />
</div>

      <div style={styles.contentRow}>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Active alerts</h2>
            <span style={styles.sectionCount}>{incidents.length}</span>
          </div>

          {loading && (
            <div style={styles.emptyText}>Loading alerts...</div>
          )}

          {!loading && incidents.length === 0 && (
            <div style={styles.emptyText}>No active incidents right now</div>
          )}

          <div style={styles.alertList}>
            {incidents.map((incident) => {
              const s = severityColors[incident.severity] || severityColors.LOW;
              return (
                <div key={incident.id} style={styles.alertItem}>
                  <span style={{ ...styles.alertDot, background: s.dot }}></span>
                  <div style={{ flex: 1 }}>
                    <div style={styles.alertTitle}>{incident.title}</div>
                    <div style={styles.alertMeta}>
                      {incident.locationName || 'Unknown location'} •{' '}
                      {new Date(incident.occurredAt).toLocaleTimeString()}
                      {incident.aiConfidence && (
                        <span style={{ ...styles.confidenceBadge,
                          background: s.bg, color: s.color }}>
                          AI: {Math.round(incident.aiConfidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ ...styles.severityBadge,
                    background: s.bg, color: s.color }}>
                    {incident.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.sosCard}>
            <div style={styles.sosTitle}>Emergency SOS</div>
            <div style={styles.sosSubtitle}>
              Sends your GPS location to nearby responders instantly
            </div>
            <button
              style={styles.sosBtn}
              onClick={() => window.location.href = '/sos'}
            >
              SOS — Send Alert
            </button>
          </div>

          <div style={styles.predictionCard}>
            <div style={styles.predictionLabel}>AI prediction</div>
            <div style={styles.predictionTitle}>
              {incidents.find(i => i.severity === 'CRITICAL')?.type || 'Cyclone'} risk: High
            </div>
            <div style={styles.predictionSub}>Based on active incidents</div>
            <div style={styles.progressBg}>
              <div style={{ ...styles.progressFill, width: '76%' }}></div>
            </div>
            <div style={styles.progressLabel}>76% confidence</div>
          </div>

          <div style={styles.tipsCard}>
            <div style={styles.predictionLabel}>Safety tips</div>
            {[
              'Stay indoors during heavy rain',
              'Keep emergency contacts ready',
              'Stock 3 days of water + food',
            ].map((tip, i) => (
              <div key={i} style={styles.tip}>
                <span style={styles.tipDot}></span>
                {tip}
              </div>
            ))}
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
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
    color: '#639922', background: '#EAF3DE', padding: '6px 12px',
    borderRadius: '20px', border: '0.5px solid #C0DD97' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%',
    background: '#639922', display: 'inline-block' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px', marginBottom: '24px' },
  statCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  statLabel: { fontSize: '12px', color: '#888780', marginBottom: '6px' },
  statValue: { fontSize: '26px', fontWeight: '500', marginBottom: '4px' },
  statSub: { fontSize: '11px', color: '#B4B2A9' },
  contentRow: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' },
  section: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center',
    gap: '8px', marginBottom: '16px' },
  sectionTitle: { fontSize: '15px', fontWeight: '500', color: '#1a1a18' },
  sectionCount: { background: '#f5f5f0', color: '#888780',
    fontSize: '12px', padding: '2px 8px', borderRadius: '20px' },
  emptyText: { fontSize: '13px', color: '#888780',
    textAlign: 'center', padding: '32px 0' },
  alertList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  alertItem: { display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '12px', background: '#f5f5f0', borderRadius: '8px' },
  alertDot: { width: '8px', height: '8px', borderRadius: '50%',
    marginTop: '4px', flexShrink: 0 },
  alertTitle: { fontSize: '13px', color: '#1a1a18', marginBottom: '4px' },
  alertMeta: { fontSize: '11px', color: '#888780',
    display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  confidenceBadge: { fontSize: '10px', padding: '2px 6px',
    borderRadius: '20px', fontWeight: '500' },
  severityBadge: { fontSize: '10px', padding: '3px 8px',
    borderRadius: '20px', fontWeight: '500', flexShrink: 0 },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sosCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  sosTitle: { fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' },
  sosSubtitle: { fontSize: '12px', color: '#888780', marginBottom: '12px', lineHeight: '1.5' },
  sosBtn: { width: '100%', padding: '12px', background: '#E24B4A', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer' },
  predictionCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  predictionLabel: { fontSize: '11px', color: '#888780', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: '6px' },
  predictionTitle: { fontSize: '14px', fontWeight: '500',
    color: '#1a1a18', marginBottom: '2px' },
  predictionSub: { fontSize: '12px', color: '#888780', marginBottom: '10px' },
  progressBg: { height: '4px', background: '#f5f5f0',
    borderRadius: '2px', marginBottom: '4px' },
  progressFill: { height: '100%', background: '#E24B4A', borderRadius: '2px' },
  progressLabel: { fontSize: '11px', color: '#888780', textAlign: 'right' },
  tipsCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  tip: { display: 'flex', alignItems: 'flex-start', gap: '8px',
    fontSize: '12px', color: '#5F5E5A', marginBottom: '8px', lineHeight: '1.5' },
  tipDot: { width: '5px', height: '5px', borderRadius: '50%',
    background: '#B4B2A9', marginTop: '5px', flexShrink: 0 },
    mapSection: {
  background: '#ffffff',
  borderRadius: '12px',
  border: '0.5px solid #e0dfd7',
  padding: '20px',
  marginBottom: '20px',
},
};