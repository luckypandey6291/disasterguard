import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import api from '../../services/api';

const STATUS = {
  IDLE: 'IDLE',
  LOCATING: 'LOCATING',
  SENDING: 'SENDING',
  SENT: 'SENT',
  ERROR: 'ERROR',
};

export default function SOSPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.IDLE);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [seconds, setSeconds] = useState(0);

  // Timer after SOS is sent
  useEffect(() => {
    let interval;
    if (status === STATUS.SENT) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  async function handleSOS() {
  setStatus(STATUS.LOCATING);
  setErrorMsg('');

  if (!navigator.geolocation) {
    setErrorMsg('Geolocation is not supported by your browser');
    setStatus(STATUS.ERROR);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        emergencyType: 'GENERAL',
      };
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setStatus(STATUS.SENDING);

      try {
        await api.post('/sos/trigger', coords);
        setStatus(STATUS.SENT);
        setSeconds(0);
      } catch (err) {
        setErrorMsg('Failed to send SOS. Please try again.');
        setStatus(STATUS.ERROR);
      }
    },
    (err) => {
      setErrorMsg(
        err.code === 1
          ? 'Location permission denied. Please allow location access.'
          : 'Could not get your location. Please try again.'
      );
      setStatus(STATUS.ERROR);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

  function handleCancel() {
    setStatus(STATUS.IDLE);
    setLocation(null);
    setSeconds(0);
    setErrorMsg('');
  }

  return (
    <AppLayout>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            ← Back to dashboard
          </button>
          <h1 style={styles.title}>Emergency SOS</h1>
          <p style={styles.subtitle}>
            Press the button below to alert nearby responders with your GPS location
          </p>
        </div>

        {/* Main SOS card */}
        <div style={styles.card}>

          {/* IDLE state */}
          {status === STATUS.IDLE && (
            <div style={styles.center}>
              <div style={styles.sosRing}>
                <button onClick={handleSOS} style={styles.sosButton}>
                  SOS
                </button>
              </div>
              <p style={styles.helpText}>
                Tap the button to send an emergency alert
              </p>
              <div style={styles.infoRow}>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>📍</span>
                  <span>Shares your GPS location</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>👮</span>
                  <span>Notifies nearby responders</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>⚡</span>
                  <span>Response within minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* LOCATING state */}
          {status === STATUS.LOCATING && (
            <div style={styles.center}>
              <div style={styles.pulseRing}>
                <div style={styles.pulseCenter}>📍</div>
              </div>
              <p style={styles.statusText}>Getting your location...</p>
              <p style={styles.statusSub}>Please allow location access if prompted</p>
            </div>
          )}

          {/* SENDING state */}
          {status === STATUS.SENDING && (
            <div style={styles.center}>
              <div style={styles.pulseRing}>
                <div style={styles.pulseCenter}>📡</div>
              </div>
              <p style={styles.statusText}>Sending SOS alert...</p>
              {location && (
                <p style={styles.coordText}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              )}
            </div>
          )}

          {/* SENT state */}
          {status === STATUS.SENT && (
            <div style={styles.center}>
              <div style={styles.successRing}>
                <div style={styles.successIcon}>✓</div>
              </div>
              <p style={styles.successText}>SOS Alert Sent!</p>
              <p style={styles.statusSub}>
                Responders have been notified with your location
              </p>
              {location && (
                <div style={styles.locationCard}>
                  <div style={styles.locationLabel}>Your location</div>
                  <div style={styles.locationCoords}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </div>
                </div>
              )}
              <div style={styles.timerBox}>
                <div style={styles.timerLabel}>Time since alert</div>
                <div style={styles.timerValue}>{formatTime(seconds)}</div>
              </div>
              <div style={styles.sentActions}>
                <button onClick={handleCancel} style={styles.cancelBtn}>
                  Cancel SOS
                </button>
              </div>
            </div>
          )}

          {/* ERROR state */}
          {status === STATUS.ERROR && (
            <div style={styles.center}>
              <div style={styles.errorRing}>
                <div style={styles.errorIcon}>✕</div>
              </div>
              <p style={styles.errorText}>SOS Failed</p>
              <p style={styles.errorMsg}>{errorMsg}</p>
              <button onClick={handleCancel} style={styles.retryBtn}>
                Try Again
              </button>
            </div>
          )}

        </div>

        {/* Emergency contacts */}
        <div style={styles.contactsCard}>
          <h3 style={styles.contactsTitle}>Emergency contacts</h3>
          <div style={styles.contactsGrid}>
            {[
              { label: 'Police', number: '100' },
              { label: 'Ambulance', number: '108' },
              { label: 'Fire', number: '101' },
              { label: 'Disaster helpline', number: '1078' },
            ].map((c) => (
              <a key={c.label} href={`tel:${c.number}`} style={styles.contactItem}>
                <div style={styles.contactNumber}>{c.number}</div>
                <div style={styles.contactLabel}>{c.label}</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

const styles = {
  page: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#888780',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '12px',
    display: 'block',
  },
  title: {
    fontSize: '22px',
    fontWeight: '500',
    color: '#1a1a18',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888780',
    lineHeight: '1.5',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '0.5px solid #e0dfd7',
    padding: '40px 24px',
    marginBottom: '16px',
    minHeight: '340px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
  },
  sosRing: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    border: '3px solid #FCEBEB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'none',
  },
  sosButton: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: '#E24B4A',
    color: '#ffffff',
    border: 'none',
    fontSize: '22px',
    fontWeight: '500',
    cursor: 'pointer',
    letterSpacing: '2px',
    boxShadow: '0 0 0 8px #FCEBEB',
  },
  helpText: {
    fontSize: '14px',
    color: '#888780',
    textAlign: 'center',
  },
  infoRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#5F5E5A',
  },
  infoIcon: {
    fontSize: '16px',
  },
  pulseRing: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '3px solid #E6F1FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCenter: {
    fontSize: '40px',
  },
  statusText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1a1a18',
  },
  statusSub: {
    fontSize: '13px',
    color: '#888780',
    textAlign: 'center',
  },
  coordText: {
    fontSize: '12px',
    color: '#888780',
    fontFamily: 'monospace',
  },
  successRing: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '3px solid #EAF3DE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#EAF3DE',
  },
  successIcon: {
    fontSize: '48px',
    color: '#639922',
  },
  successText: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#27500A',
  },
  locationCard: {
    background: '#f5f5f0',
    borderRadius: '8px',
    padding: '12px 20px',
    textAlign: 'center',
  },
  locationLabel: {
    fontSize: '11px',
    color: '#888780',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  locationCoords: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#1a1a18',
  },
  timerBox: {
    textAlign: 'center',
    background: '#FAEEDA',
    borderRadius: '8px',
    padding: '12px 24px',
  },
  timerLabel: {
    fontSize: '11px',
    color: '#633806',
    marginBottom: '4px',
  },
  timerValue: {
    fontSize: '28px',
    fontWeight: '500',
    color: '#633806',
    fontFamily: 'monospace',
  },
  sentActions: {
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: 'transparent',
    border: '0.5px solid #e0dfd7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#888780',
    cursor: 'pointer',
  },
  errorRing: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: '#FCEBEB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#E24B4A',
  },
  errorText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#A32D2D',
  },
  errorMsg: {
    fontSize: '13px',
    color: '#888780',
    textAlign: 'center',
    maxWidth: '300px',
  },
  retryBtn: {
    padding: '10px 28px',
    background: '#E24B4A',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  contactsCard: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '0.5px solid #e0dfd7',
    padding: '20px',
  },
  contactsTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a18',
    marginBottom: '14px',
  },
  contactsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  contactItem: {
    textAlign: 'center',
    padding: '12px',
    background: '#f5f5f0',
    borderRadius: '8px',
    textDecoration: 'none',
    border: '0.5px solid #e0dfd7',
  },
  contactNumber: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#E24B4A',
    marginBottom: '4px',
  },
  contactLabel: {
    fontSize: '11px',
    color: '#888780',
  },
};