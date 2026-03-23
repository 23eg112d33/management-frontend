import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      const { token, role, name } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      if (role === 'STUDENT') navigate('/student');
      else if (role === 'INSTRUCTOR') navigate('/instructor');
      else if (role === 'ADMIN') navigate('/admin');
    } catch (err) {
      setError('Invalid email or password!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brandBox}>
          <div style={styles.brandIcon}>🎓</div>
          <h1 style={styles.brandName}>EduLearn</h1>
          <p style={styles.brandTagline}>Smart Learning Management System</p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>✅ Role-based access control</div>
            <div style={styles.featureItem}>✅ Course creation & management</div>
            <div style={styles.featureItem}>✅ Assignment tracking</div>
            <div style={styles.featureItem}>✅ Real-time progress analytics</div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>Sign in to your account</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" style={loading ? styles.buttonLoading : styles.button} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.registerText}>
            New to EduLearn? <Link to="/register" style={styles.link}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', height: '100vh' },
  left: { flex: 1, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  brandBox: { color: '#fff', maxWidth: '400px' },
  brandIcon: { fontSize: '48px', marginBottom: '16px' },
  brandName: { fontSize: '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' },
  brandTagline: { fontSize: '16px', color: '#8892b0', marginBottom: '40px' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  featureItem: { fontSize: '14px', color: '#ccd6f6', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid #64ffda' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa', padding: '40px' },
  card: { background: '#fff', padding: '48px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' },
  cardHeader: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#8892b0' },
  errorBox: { background: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box', backgroundColor: '#fafafa' },
  button: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #185FA5, #0f3460)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.5px' },
  buttonLoading: { width: '100%', padding: '14px', background: '#a0aec0', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'not-allowed', marginTop: '8px' },
  registerText: { textAlign: 'center', fontSize: '14px', color: '#8892b0', marginTop: '24px' },
  link: { color: '#185FA5', textDecoration: 'none', fontWeight: '600' }
};

export default Login;