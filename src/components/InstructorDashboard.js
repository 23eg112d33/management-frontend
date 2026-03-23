import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCourses, createCourse, createAssignment, getAssignmentsByCourse, getSubmissionsByAssignment, gradeSubmission, addMaterial, getMaterialsByCourse } from '../services/api';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [newMaterial, setNewMaterial] = useState({ title: '', fileUrl: '' });
  const [gradeData, setGradeData] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  useEffect(() => { loadCourses(); }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments(selectedCourse.id);
      loadMaterials(selectedCourse.id);
    }
  }, [selectedCourse]);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const loadCourses = async () => {
    try { const res = await getMyCourses(); setCourses(res.data); } catch (err) { console.log(err); }
  };

  const loadAssignments = async (courseId) => {
    try { const res = await getAssignmentsByCourse(courseId); setAssignments(res.data); } catch (err) { console.log(err); }
  };

  const loadMaterials = async (courseId) => {
    try { const res = await getMaterialsByCourse(courseId); setMaterials(res.data); } catch (err) { console.log(err); }
  };

  const loadSubmissions = async (assignmentId) => {
    try { const res = await getSubmissionsByAssignment(assignmentId); setSubmissions(res.data); } catch (err) { console.log(err); }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await createCourse(newCourse);
      showMsg('Course created! Waiting for admin approval. ✅');
      setNewCourse({ title: '', description: '' });
      loadCourses();
    } catch (err) { showMsg('Error creating course!', 'error'); }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await addMaterial(selectedCourse.id, newMaterial);
      showMsg('Material added successfully! ✅');
      setNewMaterial({ title: '', fileUrl: '' });
      loadMaterials(selectedCourse.id);
    } catch (err) { showMsg('Error adding material!', 'error'); }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await createAssignment(selectedCourse.id, newAssignment);
      showMsg('Assignment created! ✅');
      setNewAssignment({ title: '', description: '', dueDate: '' });
      loadAssignments(selectedCourse.id);
    } catch (err) { showMsg('Error creating assignment!', 'error'); }
  };

  const handleGrade = async (submissionId) => {
    const data = gradeData[submissionId];
    if (!data?.marks) { showMsg('Please enter marks!', 'error'); return; }
    try {
      await gradeSubmission(submissionId, { marks: parseInt(data.marks), feedback: data.feedback || '' });
      showMsg('Graded successfully! ✅');
    } catch (err) { showMsg('Error grading!', 'error'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const tagColors = ['#185FA5', '#1D9E75', '#e65100', '#7b2ff7'];

  const navItems = [
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'create', label: 'Create Course', icon: '➕' },
    { id: 'materials', label: 'Course Materials', icon: '📂' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'submissions', label: 'Submissions', icon: '📋' }
  ];

  return (
    <div style={s.layout}>
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>🎓 <span style={s.logoText}>EduLearn</span></div>
          <div style={s.userCard}>
            <div style={{ ...s.avatar, background: 'linear-gradient(135deg, #e65100, #ff9800)' }}>
              {name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={s.userName}>{name}</div>
              <div style={{ ...s.userRole, color: '#ff9800' }}>Instructor</div>
            </div>
          </div>
          <nav style={s.nav}>
            {navItems.map(item => (
              <div key={item.id} style={activeTab === item.id ? s.navActive : s.navItem}
                onClick={() => setActiveTab(item.id)}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </nav>
        </div>
        <div style={s.logoutBtn} onClick={handleLogout}>🚪 Logout</div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>
              {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={s.pageSub}>Welcome back, {name}!</p>
          </div>
          <div style={s.pill}>📚 {courses.length} courses</div>
        </div>

        {message.text && (
          <div style={{ ...s.toast, background: message.type === 'success' ? '#1D9E75' : '#c62828' }}>
            {message.text}
          </div>
        )}

        {/* MY COURSES */}
        {activeTab === 'courses' && (
          <div style={s.grid}>
            {courses.length === 0 && <p style={s.empty}>No courses yet. Create one!</p>}
            {courses.map((course, i) => (
              <div key={course.id} style={s.card}>
                <div style={{ ...s.cardTop, background: `linear-gradient(135deg, ${tagColors[i % 4]}22, ${tagColors[i % 4]}44)` }}>
                  <div style={{ ...s.cardInitial, color: tagColors[i % 4] }}>{course.title.charAt(0)}</div>
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.cardTitle}>{course.title}</h3>
                  <p style={s.cardDesc}>{course.description}</p>
                  <span style={{ ...s.badge, background: course.status === 'APPROVED' ? '#e6f9ee' : course.status === 'REJECTED' ? '#fce8e8' : '#fff3e0', color: course.status === 'APPROVED' ? '#1D9E75' : course.status === 'REJECTED' ? '#c62828' : '#e65100' }}>
                    {course.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE COURSE */}
        {activeTab === 'create' && (
          <div style={s.formCard}>
            <h3 style={s.formTitle}>Create New Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div style={s.inputGroup}>
                <label style={s.label}>Course Title</label>
                <input style={s.input} placeholder="e.g. Java Spring Boot" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Description</label>
                <textarea style={{ ...s.input, height: '100px', resize: 'vertical' }} placeholder="What will students learn?" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} required />
              </div>
              <button type="submit" style={s.submitBtn}>Create Course →</button>
            </form>
          </div>
        )}

        {/* COURSE MATERIALS */}
        {activeTab === 'materials' && (
          <div>
            <div style={s.selectWrap}>
              <label style={s.label}>Select Course</label>
              <select style={s.select}
                onChange={(e) => {
                  const c = courses.find(c => c.id === parseInt(e.target.value));
                  setSelectedCourse(c);
                }} defaultValue="">
                <option value="" disabled>-- Choose a course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {!selectedCourse && <p style={s.empty}>Select a course to manage its materials.</p>}

            {selectedCourse && (
              <>
                <div style={s.formCard}>
                  <h3 style={s.formTitle}>➕ Add Material to "{selectedCourse.title}"</h3>
                  <form onSubmit={handleAddMaterial}>
                    <div style={s.inputGroup}>
                      <label style={s.label}>Material Title</label>
                      <input style={s.input} placeholder="e.g. Lecture 1 - Introduction" value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} required />
                    </div>
                    <div style={s.inputGroup}>
                      <label style={s.label}>File URL (PDF / Video / Drive link)</label>
                      <input style={s.input} placeholder="https://drive.google.com/..." value={newMaterial.fileUrl} onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })} required />
                    </div>
                    <button type="submit" style={s.submitBtn}>Add Material →</button>
                  </form>
                </div>

                <h3 style={{ ...s.formTitle, margin: '24px 0 16px' }}>📄 Uploaded Materials</h3>
                {materials.length === 0 && <p style={s.empty}>No materials uploaded yet.</p>}
                <div style={s.grid}>
                  {materials.map(m => (
                    <div key={m.id} style={s.materialCard}>
                      <div style={s.materialIcon}>📄</div>
                      <div>
                        <h4 style={s.cardTitle}>{m.title}</h4>
                        <a href={m.fileUrl} target="_blank" rel="noreferrer" style={s.link}>View / Download →</a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div>
            <div style={s.selectWrap}>
              <label style={s.label}>Select Course</label>
              <select style={s.select}
                onChange={(e) => {
                  const c = courses.find(c => c.id === parseInt(e.target.value));
                  setSelectedCourse(c);
                }} defaultValue="">
                <option value="" disabled>-- Choose a course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {!selectedCourse && <p style={s.empty}>Select a course to manage assignments.</p>}

            {selectedCourse && (
              <>
                <div style={s.formCard}>
                  <h3 style={s.formTitle}>➕ Create Assignment for "{selectedCourse.title}"</h3>
                  <form onSubmit={handleCreateAssignment}>
                    <div style={s.inputGroup}>
                      <label style={s.label}>Title</label>
                      <input style={s.input} placeholder="e.g. Build a REST API" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} required />
                    </div>
                    <div style={s.inputGroup}>
                      <label style={s.label}>Description</label>
                      <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} placeholder="Describe the assignment..." value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} required />
                    </div>
                    <div style={s.inputGroup}>
                      <label style={s.label}>Due Date</label>
                      <input style={s.input} type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} required />
                    </div>
                    <button type="submit" style={s.submitBtn}>Create Assignment →</button>
                  </form>
                </div>

                <h3 style={{ ...s.formTitle, margin: '24px 0 16px' }}>📝 Existing Assignments</h3>
                {assignments.length === 0 && <p style={s.empty}>No assignments yet.</p>}
                <div style={s.grid}>
                  {assignments.map(a => (
                    <div key={a.id} style={s.assignCard}>
                      <h4 style={s.cardTitle}>{a.title}</h4>
                      <p style={s.cardDesc}>{a.description}</p>
                      <p style={s.dueDate}>📅 Due: {a.dueDate}</p>
                      <button style={{ ...s.submitBtn, fontSize: '13px', padding: '8px' }}
                        onClick={() => { setActiveTab('submissions'); loadSubmissions(a.id); }}>
                        View Submissions →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div>
            {submissions.length === 0 && <p style={s.empty}>Go to Assignments → click "View Submissions" on an assignment.</p>}
            <div style={s.grid}>
              {submissions.map(sub => (
                <div key={sub.id} style={s.assignCard}>
                  <div style={s.assignHeader}>
                    <h4 style={s.cardTitle}>👤 {sub.studentName}</h4>
                    <span style={{ ...s.badge, background: sub.status === 'GRADED' ? '#e6f9ee' : '#fff3e0', color: sub.status === 'GRADED' ? '#1D9E75' : '#e65100' }}>
                      {sub.status}
                    </span>
                  </div>
                  <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={s.link}>📎 View Submission</a>
                  {sub.status === 'SUBMITTED' && (
                    <div style={{ marginTop: '12px' }}>
                      <input style={{ ...s.input, marginBottom: '8px' }} type="number" placeholder="Marks (out of 100)"
                        onChange={(e) => setGradeData({ ...gradeData, [sub.id]: { ...gradeData[sub.id], marks: e.target.value } })} />
                      <input style={{ ...s.input, marginBottom: '8px' }} placeholder="Feedback"
                        onChange={(e) => setGradeData({ ...gradeData, [sub.id]: { ...gradeData[sub.id], feedback: e.target.value } })} />
                      <button style={s.submitBtn} onClick={() => handleGrade(sub.id)}>Grade →</button>
                    </div>
                  )}
                  {sub.status === 'GRADED' && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={s.cardDesc}>Marks: <strong>{sub.marks}/100</strong></p>
                      <p style={s.cardDesc}>Feedback: {sub.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  layout: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: '240px', background: '#1a1a2e', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', flexShrink: 0 },
  sidebarTop: { display: 'flex', flexDirection: 'column' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', fontSize: '18px', fontWeight: '700', color: '#fff' },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#fff' },
  userCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', margin: '0 12px 20px', borderRadius: '12px' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  userName: { fontSize: '14px', fontWeight: '600', color: '#fff' },
  userRole: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', color: '#8892b0', cursor: 'pointer' },
  navActive: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', color: '#fff', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '600' },
  logoutBtn: { padding: '11px 26px', fontSize: '14px', color: '#ff6b6b', cursor: 'pointer' },
  main: { flex: 1, overflowY: 'auto', backgroundColor: '#f5f7fa', padding: '32px' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  pageSub: { fontSize: '14px', color: '#8892b0' },
  pill: { background: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: '#4a5568', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  toast: { color: '#fff', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  cardTop: { padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  cardInitial: { width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700' },
  cardBody: { padding: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  cardDesc: { fontSize: '13px', color: '#8892b0', marginBottom: '8px', lineHeight: '1.5' },
  badge: { fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block' },
  formCard: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', maxWidth: '520px', marginBottom: '24px' },
  formTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fafafa' },
  submitBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #185FA5, #0f3460)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  selectWrap: { marginBottom: '24px' },
  select: { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '280px', background: '#fff' },
  materialCard: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' },
  materialIcon: { fontSize: '32px' },
  link: { fontSize: '13px', color: '#185FA5', textDecoration: 'none', fontWeight: '600' },
  assignCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  assignHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  dueDate: { fontSize: '12px', color: '#e65100', marginBottom: '14px', fontWeight: '500' },
  empty: { color: '#8892b0', fontSize: '14px', padding: '10px 0' }
};

export default InstructorDashboard;