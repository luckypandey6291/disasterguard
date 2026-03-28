import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const ROLES = [
  { value: 'CIVILIAN', label: 'Civilian — I need alerts & SOS' },
  { value: 'RESPONDER', label: 'Responder — Police / rescue worker' },
  { value: 'NGO', label: 'NGO — Relief organization' },
];

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CIVILIAN',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      const { token, id, name, email, role } = response.data;
      login({ id, name, email, role }, token);

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'RESPONDER') navigate('/responder');
      else navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#E24B4A"/>
              <path d="M16 7L20 13H24L20 19H22L16 26L10 19H12L8 13H12L16 7Z"
                fill="white" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Join DisasterGuard today</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirm *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Same password"
                style={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f0',
    padding: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '0.5px solid #e0dfd7',
    padding: '36px',
    width: '100%',
    maxWidth: '500px',
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  logo: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' },
  subtitle: { fontSize: '14px', color: '#888780' },
  error: {
    background: '#FCEBEB',
    color: '#A32D2D',
    border: '0.5px solid #F09595',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#444441' },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '0.5px solid #c8c7bf',
    fontSize: '14px',
    color: '#1a1a18',
    background: '#fff',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '0.5px solid #c8c7bf',
    fontSize: '14px',
    color: '#1a1a18',
    background: '#fff',
    outline: 'none',
  },
  button: {
    padding: '11px',
    background: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '4px',
  },
  footer: { textAlign: 'center', fontSize: '13px', color: '#888780', marginTop: '18px' },
  link: { color: '#E24B4A', textDecoration: 'none', fontWeight: '500' },
};