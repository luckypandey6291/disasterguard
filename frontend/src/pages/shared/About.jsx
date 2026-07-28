import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function About() {
  const hqLocation = [22.5726, 88.3639];

  return (
    <div style={styles.container}>
      {/* Hero Banner */}
      <div style={styles.hero}>
        <div style={styles.badge}>HACKATHON EDITION</div>
        <h1 style={styles.title}>About DisasterGuard</h1>
        <p style={styles.subtitle}>
          DisasterGuard is an intelligent, real-time crisis management and disaster response platform designed to bridge civilians, emergency responders, NGOs, and administrative authorities during critical emergencies.
        </p>
      </div>

      {/* Grid Features */}
      <div className="responsive-grid-3" style={styles.grid3}>
        <div style={styles.card}>
          <div style={{ ...styles.iconBox, background: '#E24B4A1A', color: '#E24B4A' }}>🚨</div>
          <h3 style={styles.cardTitle}>Instant SOS Alert System</h3>
          <p style={styles.cardText}>
            Civilians can broadcast one-tap emergency SOS signals with precise GPS coordinates, triggering instant STOMP WebSocket alerts to nearby rescue teams.
          </p>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.iconBox, background: '#7F77DD1A', color: '#7F77DD' }}>🤖</div>
          <h3 style={styles.cardTitle}>AI-Assisted Risk Analysis</h3>
          <p style={styles.cardText}>
            Integrated with Gemini 1.5 AI microservices to automatically classify incident severity, generate emergency risk summaries, and recommend tactical dispatch strategies.
          </p>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.iconBox, background: '#6399221A', color: '#639922' }}>📲</div>
          <h3 style={styles.cardTitle}>Omnichannel FCM Notifications</h3>
          <p style={styles.cardText}>
            Delivers critical push notifications to responders and citizens via Firebase Cloud Messaging (FCM) even when the browser or app tab is closed.
          </p>
        </div>
      </div>

      {/* Role Breakdown */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How DisasterGuard Empowers Stakeholders</h2>
        <div className="responsive-split" style={styles.split}>
          <div style={styles.roleCard}>
            <h4 style={{ color: '#E24B4A', marginBottom: '8px' }}>👤 For Civilians</h4>
            <ul style={styles.list}>
              <li>One-touch SOS dispatch with automated live GPS tracking</li>
              <li>Real-time disaster risk updates and official shelter locations</li>
              <li>Resource and donation requests for relief supplies</li>
            </ul>
          </div>

          <div style={styles.roleCard}>
            <h4 style={{ color: '#7F77DD', marginBottom: '8px' }}>🚑 For Responders</h4>
            <ul style={styles.list}>
              <li>Live incident dispatch queue with real-time map navigation</li>
              <li>Instant notification when an emergency SOS is assigned</li>
              <li>Status tracking (Pending, Assigned, Resolved)</li>
            </ul>
          </div>

          <div style={styles.roleCard}>
            <h4 style={{ color: '#2B8A3E', marginBottom: '8px' }}>🏛️ For Admins & NGOs</h4>
            <ul style={styles.list}>
              <li>Command center map analytics and city-wide risk heatmaps</li>
              <li>Incident reporting, severity classification, and resource allocation</li>
              <li>Seamless team dispatch and response monitoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Central Command & Operations HQ</h2>
        <p style={{ ...styles.cardText, marginBottom: '16px' }}>
          DisasterGuard Emergency Operations Center coordinates regional disaster monitoring and responder dispatch from our central facility.
        </p>

        <div style={styles.mapContainer}>
          <MapContainer
            center={hqLocation}
            zoom={13}
            style={{ height: '360px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CircleMarker
              center={hqLocation}
              radius={14}
              fillColor="#E24B4A"
              color="#ffffff"
              weight={3}
              fillOpacity={0.9}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', padding: '4px' }}>
                  <strong style={{ color: '#E24B4A' }}>DisasterGuard Central Command HQ</strong><br />
                  📍 Sector V, Salt Lake, Kolkata, West Bengal<br />
                  <small>24/7 Operations & AI Emergency Processing Center</small>
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  hero: {
    background: 'linear-gradient(135deg, #1A1A18 0%, #2D2C2A 100%)',
    color: '#ffffff',
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#E24B4A',
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#CCCCCC',
    maxWidth: '780px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E5E5E0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1A1A18',
    marginBottom: '8px',
  },
  cardText: {
    fontSize: '14px',
    color: '#666660',
    lineHeight: '1.5',
  },
  section: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #E5E5E0',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1A1A18',
    marginBottom: '16px',
  },
  split: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  roleCard: {
    background: '#F9F9F6',
    borderRadius: '10px',
    padding: '18px',
    border: '1px solid #EDEDE8',
  },
  list: {
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#444440',
    lineHeight: '1.6',
  },
  mapContainer: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #E5E5E0',
  },
};
