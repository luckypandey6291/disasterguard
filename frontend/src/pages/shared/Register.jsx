import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';
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
        role: formData.role || 'CIVILIAN',
      });

      const userRole = response.data.role || formData.role || 'CIVILIAN';
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
      let firebaseUid = null;
      let idToken = null;

      try {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        firebaseUid = userCred.user.uid;
        idToken = await userCred.user.getIdToken();
      } catch (fbErr) {
        console.warn("Firebase Auth direct signup bypassed/failed:", fbErr.message);
      }

      const response = await api.post('/auth/sync', {
        firebaseUid: firebaseUid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
      });

      const { id, name, email, role } = response.data;
      login({ id, name, email, role }, idToken || 'legacy-token');

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'RESPONDER') navigate('/responder');
      else navigate('/dashboard');

    } catch (err) {
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
        return;
      } catch (legacyErr) {
        setError(err.response?.data?.message || 'Registration failed. Try again.');
      }
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
          <p style={styles.subtitle}>Join DisasterGuard with Firebase Auth</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

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
          Sign up with Google
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="responsive-form-row" style={styles.row}>
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

          <div className="responsive-form-row" style={styles.row}>
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
  footer: { textAlign: 'center', fontSize: '13px', color: '#888780', marginTop: '18px' },
  link: { color: '#E24B4A', textDecoration: 'none', fontWeight: '500' },
};