import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registerUser(form);
      const { token, role, name } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      if (role === 'STUDENT') navigate('/student');
      else if (role === 'INSTRUCTOR') navigate('/instructor');
      else if (role === 'ADMIN') navigate('/admin');
    } catch (err) {
      setError('Registration failed! Email may already exist.');
    }
    setLoading(false);
  };

  const roleColors = { STUDENT: '#185FA5', INSTRUCTOR: '#e65100', ADMIN: '#c62828' };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brandBox}>
          <div style={styles.brandIcon}>🎓</div>
          <h1 style={styles.brandName}>EduLearn</h1>
          <p style={styles.brandTagline}>Join thousands of learners today</p>
          <div style={styles.roleCards}>
            <div style={styles.roleCard}><span style={styles.roleEmoji}>👨‍🎓</span><span>Student</span></div>
            <div style={styles.roleCard}><span style={styles.roleEmoji}>👨‍🏫</span><span>Instructor</span></div>
            <div style={styles.roleCard}><span style={styles.roleEmoji}>⚙️</span><span>Admin</span></div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Create account</h2>
            <p style={styles.subtitle}>Start your learning journey</p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleRegister}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>I am a</label>
              <div style={styles.roleSelector}>
                {['STUDENT', 'INSTRUCTOR', 'ADMIN'].map(r => (
                  <div key={r} style={{ ...styles.roleOption, borderColor: form.role === r ? roleColors[r] : '#e2e8f0', background: form.role === r ? `${roleColors[r]}10` : '#fff', color: form.role === r ? roleColors[r] : '#4a5568' }} onClick={() => setForm({ ...form, role: r })}>
                    {r === 'STUDENT' ? '👨‍🎓' : r === 'INSTRUCTOR' ? '👨‍🏫' : '⚙️'} {r}
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" style={loading ? styles.buttonLoading : styles.button} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.loginText}>
            Already have an account? <Link to="/" style={styles.link}>Sign in</Link>
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
  brandName: { fontSize: '36px', fontWeight: '700', marginBottom: '8px' },
  brandTagline: { fontSize: '16px', color: '#8892b0', marginBottom: '40px' },
  roleCards: { display: 'flex', gap: '12px' },
  roleCard: { flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ccd6f6', border: '1px solid rgba(255,255,255,0.1)' },
  roleEmoji: { fontSize: '28px' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa', padding: '40px' },
  card: { background: '#fff', padding: '48px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' },
  cardHeader: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#8892b0' },
  errorBox: { background: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' },
  inputGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fafafa' },
  roleSelector: { display: 'flex', gap: '10px' },
  roleOption: { flex: 1, padding: '10px', border: '1.5px solid', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' },
  button: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #185FA5, #0f3460)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  buttonLoading: { width: '100%', padding: '14px', background: '#a0aec0', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'not-allowed', marginTop: '8px' },
  loginText: { textAlign: 'center', fontSize: '14px', color: '#8892b0', marginTop: '24px' },
  link: { color: '#185FA5', textDecoration: 'none', fontWeight: '600' }
};

export default Register;