import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';
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
      let idToken = null;
      let firebaseUid = null;

      try {
        const userCred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        idToken = await userCred.user.getIdToken();
        firebaseUid = userCred.user.uid;
      } catch (fbErr) {
        console.warn("Firebase Client Auth direct attempt bypassed/failed:", fbErr.message);
      }

      // Sync user profile & role with backend
      const response = await api.post('/auth/sync', {
        email: formData.email,
        firebaseUid: firebaseUid,
      });

      const { id, name, email, role } = response.data;
      login({ id, name, email, role }, idToken || 'legacy-token');

      // Route based on role
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'RESPONDER') navigate('/responder');
      else navigate('/dashboard');

    } catch (err) {
      // Legacy Fallback for pre-existing accounts
      try {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        const { token, id, name, email, role } = response.data;
        login({ id, name, email, role }, token);
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'RESPONDER') navigate('/responder');
        else navigate('/dashboard');
        return;
      } catch (legacyErr) {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const firebaseUid = result.user.uid;
      const email = result.user.email;
      const name = result.user.displayName || email.split('@')[0];

      const response = await api.post('/auth/sync', {
        email,
        name,
        firebaseUid,
        role: 'CIVILIAN',
      });

      const userRole = response.data.role || 'CIVILIAN';
      login({ id: response.data.id, name: response.data.name, email: response.data.email, role: userRole }, idToken);

      if (userRole === 'ADMIN') navigate('/admin');
      else if (userRole === 'RESPONDER') navigate('/responder');
      else navigate('/dashboard');
    } catch (err) {
      console.warn("Google Sign-In Notice:", err.message);
      setError(err.message?.includes('popup-closed') ? 'Sign-in popup was closed' : 'Google Sign-In failed. Check Firebase settings.');
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
          <p style={styles.subtitle}>Sign in with Firebase Auth</p>
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={styles.googleBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          Sign in with Google
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

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
          <p style={styles.demoTitle}>Demo accounts</p>
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
  googleBtn: {
    width: '100%',
    padding: '11px',
    background: '#ffffff',
    color: '#3c4043',
    border: '0.5px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e0dfd7',
  },
  dividerText: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#888780',
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