import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  }

async function handleSubmit(e) {
  e.preventDefault();
  if (!formData.email || !formData.password) {
    setError('Please fill in all fields');
    return;
  }
  setLoading(true);
  try {
    const response = await api.post('/auth/login', {
      email: formData.email,
      password: formData.password,
    });

    const { token, id, name, email, role } = response.data;
    login({ id, name, email, role }, token);

    // Role ke hisaab se redirect
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'RESPONDER') navigate('/responder');
    else navigate('/dashboard');

  } catch (err) {
    setError(err.response?.data?.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo / Title */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#E24B4A"/>
              <path d="M16 7L20 13H24L20 19H22L16 26L10 19H12L8 13H12L16 7Z"
                fill="white" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={styles.title}>DisasterGuard</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={styles.input}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>

        {/* Demo hint */}
        <div style={styles.demo}>
          <p style={styles.demoTitle}>Demo accounts (once backend is ready)</p>
          <p style={styles.demoText}>civilian@test.com / password123</p>
          <p style={styles.demoText}>responder@test.com / password123</p>
          <p style={styles.demoText}>admin@test.com / password123</p>
        </div>

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
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px',
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
  },
  error: {
    background: '#FCEBEB',
    color: '#A32D2D',
    border: '0.5px solid #F09595',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#444441',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '0.5px solid #c8c7bf',
    fontSize: '14px',
    color: '#1a1a18',
    background: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  button: {
    padding: '11px',
    background: '#E24B4A',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'background 0.15s',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888780',
    marginTop: '20px',
  },
  link: {
    color: '#E24B4A',
    textDecoration: 'none',
    fontWeight: '500',
  },
  demo: {
    marginTop: '20px',
    padding: '12px',
    background: '#f5f5f0',
    borderRadius: '8px',
    border: '0.5px solid #e0dfd7',
  },
  demoTitle: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#888780',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  demoText: {
    fontSize: '12px',
    color: '#5F5E5A',
    fontFamily: 'monospace',
    marginBottom: '2px',
  },
};