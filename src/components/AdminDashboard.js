import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses, updateCourseStatus } from '../services/api';

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try { const res = await getAllCourses(); setCourses(res.data); }
    catch (err) { console.log(err); }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateCourseStatus(id, status);
      setMessage(`Course ${status.toLowerCase()} successfully!`);
      loadCourses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error updating status!'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const filtered = filter === 'ALL' ? courses : courses.filter(c => c.status === filter);
  const pending = courses.filter(c => c.status === 'PENDING').length;
  const approved = courses.filter(c => c.status === 'APPROVED').length;
  const rejected = courses.filter(c => c.status === 'REJECTED').length;

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logo}>🎓 <span style={styles.logoText}>EduLearn</span></div>
          <div style={styles.userCard}>
            <div style={styles.avatar}>{name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{name}</div>
              <div style={styles.userRole}>Admin</div>
            </div>
          </div>
          <div style={styles.navItemActive}><span>📋</span> Course Management</div>
        </div>
        <div style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>📋 Course Management</h1>
            <p style={styles.headerSub}>Review and approve instructor courses</p>
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #e65100' }}>
            <div style={styles.statNum}>{pending}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #1D9E75' }}>
            <div style={styles.statNum}>{approved}</div>
            <div style={styles.statLabel}>Approved</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #c62828' }}>
            <div style={styles.statNum}>{rejected}</div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #185FA5' }}>
            <div style={styles.statNum}>{courses.length}</div>
            <div style={styles.statLabel}>Total</div>
          </div>
        </div>

        {message && <div style={styles.toast}>{message}</div>}

        <div style={styles.filterRow}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button key={f} style={filter === f ? styles.filterActive : styles.filterBtn} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <div style={styles.grid}>
          {filtered.map(course => (
            <div key={course.id} style={styles.courseCard}>
              <div style={styles.courseCardHeader}>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <span style={{ ...styles.badge, background: course.status === 'APPROVED' ? '#e6f9ee' : course.status === 'REJECTED' ? '#fce8e8' : '#fff3e0', color: course.status === 'APPROVED' ? '#1D9E75' : course.status === 'REJECTED' ? '#c62828' : '#e65100' }}>
                  {course.status}
                </span>
              </div>
              <p style={styles.courseDesc}>{course.description}</p>
              <p style={styles.courseInst}>👨‍🏫 {course.instructorName}</p>
              {course.status === 'PENDING' && (
                <div style={styles.actionRow}>
                  <button style={styles.approveBtn} onClick={() => handleStatus(course.id, 'APPROVED')}>✅ Approve</button>
                  <button style={styles.rejectBtn} onClick={() => handleStatus(course.id, 'REJECTED')}>❌ Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: '240px', background: '#1a1a2e', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', flexShrink: 0 },
  sidebarTop: { display: 'flex', flexDirection: 'column', gap: '8px' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#fff' },
  userCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', margin: '0 12px 16px', borderRadius: '12px' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #c62828, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  userName: { fontSize: '14px', fontWeight: '600', color: '#fff' },
  userRole: { fontSize: '11px', color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '1px' },
  navItemActive: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 26px', fontSize: '14px', color: '#fff', background: 'rgba(255,255,255,0.1)', fontWeight: '600' },
  logoutBtn: { padding: '11px 26px', fontSize: '14px', color: '#ff6b6b', cursor: 'pointer' },
  main: { flex: 1, overflowY: 'auto', backgroundColor: '#f5f7fa', padding: '32px' },
  header: { marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  headerSub: { fontSize: '14px', color: '#8892b0' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  statNum: { fontSize: '32px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#8892b0' },
  toast: { background: '#1D9E75', color: '#fff', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
  filterRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  filterBtn: { padding: '8px 20px', borderRadius: '20px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#4a5568', fontWeight: '500' },
  filterActive: { padding: '8px 20px', borderRadius: '20px', border: '1.5px solid #185FA5', background: '#185FA5', fontSize: '13px', cursor: 'pointer', color: '#fff', fontWeight: '600' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  courseCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  courseCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  courseTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', flex: 1, marginRight: '10px' },
  badge: { fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', flexShrink: 0 },
  courseDesc: { fontSize: '13px', color: '#8892b0', marginBottom: '10px', lineHeight: '1.5' },
  courseInst: { fontSize: '12px', color: '#4a5568', marginBottom: '16px' },
  actionRow: { display: 'flex', gap: '10px' },
  approveBtn: { flex: 1, padding: '9px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '9px', background: '#fff', color: '#c62828', border: '1.5px solid #c62828', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
};

export default AdminDashboard;