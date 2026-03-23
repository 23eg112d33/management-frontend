import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMaterialsByCourse, addMaterial } from '../services/api';

function CourseMaterials() {
  const { courseId, courseTitle } = useParams();
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: '', fileUrl: '' });
  const [message, setMessage] = useState('');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  useEffect(() => { loadMaterials(); }, []);

  const loadMaterials = async () => {
    try {
      const res = await getMaterialsByCourse(courseId);
      setMaterials(res.data);
    } catch (err) { console.log(err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addMaterial(courseId, form);
      setMessage('Material added!');
      setForm({ title: '', fileUrl: '' });
      loadMaterials();
    } catch (err) { setMessage('Error adding material!'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={styles.title}>📚 {decodeURIComponent(courseTitle)}</h2>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {role === 'INSTRUCTOR' && (
        <div style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Add Material</h3>
          <form onSubmit={handleAdd}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} placeholder="e.g. Lecture 1 - Introduction" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>File URL (PDF/Video link)</label>
              <input style={styles.input} placeholder="https://..." value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} required />
            </div>
            <button type="submit" style={styles.button}>Add Material</button>
          </form>
        </div>
      )}

      <h3 style={styles.sectionTitle}>Course Materials</h3>
      {materials.length === 0 ? (
        <p style={styles.empty}>No materials uploaded yet.</p>
      ) : (
        <div style={styles.grid}>
          {materials.map(m => (
            <div key={m.id} style={styles.card}>
              <h4 style={styles.cardTitle}>📄 {m.title}</h4>
              <a href={m.fileUrl} target="_blank" rel="noreferrer" style={styles.link}>View / Download</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh' },
  topbar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  backBtn: { background: '#fff', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  title: { fontSize: '20px', fontWeight: '600', color: '#1a1a2e' },
  message: { background: '#e6f9ee', color: '#1D9E75', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: '500px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '16px' },
  inputGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  button: { background: '#185FA5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '10px' },
  link: { fontSize: '13px', color: '#185FA5', textDecoration: 'none' },
  empty: { color: '#999', fontSize: '14px' }
};

export default CourseMaterials;