import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_COLORS = {
  CRITICAL: '#E24B4A',
  HIGH: '#E24B4A',
  MEDIUM: '#EF9F27',
  LOW: '#639922',
};

export default function DisasterMap({ incidents = [], sosAlerts = [], height = '320px' }) {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', height , position: 'relative',
  zIndex: 1}}>
      <MapContainer
        center={[22.5726, 88.3639]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Incident markers */}
        {incidents.map((incident) => {
          if (!incident.latitude || !incident.longitude) return null;
          const color = SEVERITY_COLORS[incident.severity] || '#888780';
          return (
            <CircleMarker
              key={`inc-${incident.id}`}
              center={[incident.latitude, incident.longitude]}
              radius={10}
              fillColor={color}
              color="white"
              weight={2}
              fillOpacity={0.9}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', minWidth: '160px' }}>
                  <div style={{ fontWeight: '500', fontSize: '13px', marginBottom: '4px' }}>
                    {incident.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                    📍 {incident.locationName || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '11px' }}>
                    <span style={{
                      background: color + '22',
                      color: color,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: '500',
                    }}>
                      {incident.severity}
                    </span>
                    {incident.aiConfidence && (
                      <span style={{ marginLeft: '6px', color: '#888' }}>
                        AI: {Math.round(incident.aiConfidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* SOS markers */}
        {sosAlerts.map((sos) => {
          if (!sos.latitude || !sos.longitude) return null;
          return (
            <CircleMarker
              key={`sos-${sos.id}`}
              center={[sos.latitude, sos.longitude]}
              radius={12}
              fillColor="#7F77DD"
              color="white"
              weight={2}
              fillOpacity={0.9}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', minWidth: '160px' }}>
                  <div style={{ fontWeight: '500', fontSize: '13px',
                    color: '#E24B4A', marginBottom: '4px' }}>
                    SOS Alert
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                    {sos.user?.name || 'Unknown User'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {sos.emergencyType || 'GENERAL'} •{' '}
                    {new Date(sos.triggeredAt).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}