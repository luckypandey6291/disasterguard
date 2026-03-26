import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#f5f5f0', gap: '16px' }}>
      <div style={{ fontSize: '48px', fontWeight: '500', color: '#D3D1C7' }}>404</div>
      <p style={{ fontSize: '16px', color: '#888780' }}>Page not found</p>
      <Link to="/login" style={{ fontSize: '14px', color: '#E24B4A', textDecoration: 'none',
        fontWeight: '500' }}>Go to login</Link>
    </div>
  );
}