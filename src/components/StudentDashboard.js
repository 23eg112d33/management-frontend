import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getApprovedCourses, getMyEnrollments, enrollCourse,
  getMySubmissions, getAssignmentsByCourse, submitAssignment,
  getMaterialsByCourse
} from '../services/api';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [submitForm, setSubmitForm] = useState({ assignmentId: null, fileUrl: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');
  const [ratings, setRatings] = useState({});
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  useEffect(() => {
    loadCourses();
    loadEnrollments();
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadAssignments(parseInt(selectedCourseId));
      loadMaterials(parseInt(selectedCourseId));
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try { const res = await getApprovedCourses(); setCourses(res.data); } catch (err) { console.log(err); }
  };
  const loadEnrollments = async () => {
    try { const res = await getMyEnrollments(); setEnrollments(res.data); } catch (err) { console.log(err); }
  };
  const loadSubmissions = async () => {
    try { const res = await getMySubmissions(); setSubmissions(res.data); } catch (err) { console.log(err); }
  };
  const loadAssignments = async (courseId) => {
    try { const res = await getAssignmentsByCourse(courseId); setAssignments(res.data); } catch (err) { console.log(err); }
  };
  const loadMaterials = async (courseId) => {
    try { const res = await getMaterialsByCourse(courseId); setMaterials(res.data); } catch (err) { console.log(err); }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleEnroll = async (courseId) => {
    const already = enrollments.find(e => e.courseId === courseId);
    if (already) { showMessage('You are already enrolled in this course!', 'warn'); return; }
    try {
      await enrollCourse(courseId);
      showMessage('Enrolled successfully! 🎉', 'success');
      loadEnrollments();
    } catch (err) { showMessage('Failed to enroll. Try again!', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitAssignment(submitForm.assignmentId, { fileUrl: submitForm.fileUrl });
      showMessage('Assignment submitted! ✅', 'success');
      setSubmitForm({ assignmentId: null, fileUrl: '' });
      loadSubmissions();
    } catch (err) { showMessage('Already submitted or error!', 'error'); }
  };

  const handleRate = (courseId, star) => {
    setRatings(prev => ({ ...prev, [courseId]: star }));
    showMessage(`Rated ${star} ⭐ successfully!`, 'success');
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const tagColors = ['#185FA5', '#1D9E75', '#e65100', '#7b2ff7'];

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.instructorName.toLowerCase().includes(search.toLowerCase())
  );

  const gradedCount = submissions.filter(s => s.status === 'GRADED').length;
  const pendingCount = submissions.filter(s => s.status === 'SUBMITTED').length;
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / enrollments.length)
    : 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'courses', label: 'Browse Courses', icon: '📚' },
    { id: 'enrollments', label: 'My Enrollments', icon: '📖' },
    { id: 'materials', label: 'Course Materials', icon: '📂' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'submissions', label: 'My Submissions', icon: '✅' }
  ];

  return (
    <div style={s.layout}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>🎓 <span style={s.logoText}>EduLearn</span></div>
          <div style={s.userCard}>
            <div style={{ ...s.avatar, background: 'linear-gradient(135deg, #185FA5, #64ffda)' }}>
              {name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={s.userName}>{name}</div>
              <div style={{ ...s.userRole, color: '#64ffda' }}>Student</div>
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

      {/* MAIN */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>
              {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={s.pageSub}>Welcome back, {name}!</p>
          </div>
          <div style={s.pillRow}>
            <div style={s.pill}>📚 {courses.length} courses</div>
            <div style={s.pill}>📖 {enrollments.length} enrolled</div>
          </div>
        </div>

        {message.text && (
          <div style={{ ...s.toast, background: message.type === 'success' ? '#1D9E75' : message.type === 'warn' ? '#e65100' : '#c62828' }}>
            {message.text}
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={s.statsRow}>
              <div style={{ ...s.statCard, borderTop: '4px solid #185FA5' }}>
                <div style={s.statNum}>{enrollments.length}</div>
                <div style={s.statLabel}>Enrolled Courses</div>
              </div>
              <div style={{ ...s.statCard, borderTop: '4px solid #1D9E75' }}>
                <div style={s.statNum}>{gradedCount}</div>
                <div style={s.statLabel}>Graded</div>
              </div>
              <div style={{ ...s.statCard, borderTop: '4px solid #e65100' }}>
                <div style={s.statNum}>{pendingCount}</div>
                <div style={s.statLabel}>Pending</div>
              </div>
              <div style={{ ...s.statCard, borderTop: '4px solid #7b2ff7' }}>
                <div style={s.statNum}>{avgProgress}%</div>
                <div style={s.statLabel}>Avg Progress</div>
              </div>
            </div>

            <div style={s.progressCard}>
              <h3 style={s.sectionTitle}>📖 Course Progress</h3>
              {enrollments.length === 0 && <p style={s.empty}>Enroll in courses to see progress.</p>}
              {enrollments.map((e, i) => (
                <div key={e.id} style={s.progressItem}>
                  <div style={s.progressItemRow}>
                    <span style={s.progressCourseName}>{e.courseTitle}</span>
                    <span style={{ ...s.progressPct, color: tagColors[i % 4] }}>{e.progressPercent}%</span>
                  </div>
                  <div style={s.progressBg}>
                    <div style={{ ...s.progressFill, width: `${e.progressPercent}%`, background: tagColors[i % 4] }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BROWSE COURSES */}
        {activeTab === 'courses' && (
          <div>
            <div style={s.searchWrap}>
              <span>🔍</span>
              <input style={s.searchInput} placeholder="Search by name, description or instructor..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>}
            </div>
            <p style={s.searchResult}>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found{search && ` for "${search}"`}</p>
            <div style={s.grid}>
              {filteredCourses.length === 0 && <p style={s.empty}>No courses match your search.</p>}
              {filteredCourses.map((course, i) => {
                const isEnrolled = enrollments.find(e => e.courseId === course.id);
                const userRating = ratings[course.id] || 0;
                return (
                  <div key={course.id} style={s.card}>
                    <div style={{ ...s.cardTop, background: `linear-gradient(135deg, ${tagColors[i % 4]}22, ${tagColors[i % 4]}44)` }}>
                      <div style={{ ...s.cardInitial, color: tagColors[i % 4] }}>{course.title.charAt(0)}</div>
                    </div>
                    <div style={s.cardBody}>
                      <h3 style={s.cardTitle}>{course.title}</h3>
                      <p style={s.cardDesc}>{course.description}</p>
                      <p style={s.cardInst}>👨‍🏫 {course.instructorName}</p>
                      {isEnrolled && (
                        <div style={s.ratingWrap}>
                          <span style={s.ratingLabel}>Rate: </span>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} style={{ ...s.star, color: star <= userRating ? '#f59e0b' : '#d1d5db' }} onClick={() => handleRate(course.id, star)}>★</span>
                          ))}
                        </div>
                      )}
                      <button style={{ ...s.btn, background: isEnrolled ? '#1D9E75' : tagColors[i % 4] }} onClick={() => handleEnroll(course.id)}>
                        {isEnrolled ? '✅ Enrolled' : 'Enroll Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MY ENROLLMENTS */}
        {activeTab === 'enrollments' && (
          <div style={s.grid}>
            {enrollments.length === 0 && <p style={s.empty}>You have not enrolled in any course yet.</p>}
            {enrollments.map((e, i) => (
              <div key={e.id} style={{ ...s.card, cursor: 'pointer' }} onClick={() => { setSelectedCourseId(e.courseId); setActiveTab('materials'); }}>
                <div style={{ ...s.cardTop, background: `linear-gradient(135deg, ${tagColors[i % 4]}22, ${tagColors[i % 4]}44)` }}>
                  <div style={{ ...s.cardInitial, color: tagColors[i % 4] }}>{e.courseTitle.charAt(0)}</div>
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.cardTitle}>{e.courseTitle}</h3>
                  <div style={s.progressItem}>
                    <div style={s.progressItemRow}>
                      <span style={s.progressLabel}>Progress</span>
                      <span style={{ ...s.progressPct, color: tagColors[i % 4] }}>{e.progressPercent}%</span>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${e.progressPercent}%`, background: tagColors[i % 4] }}></div>
                    </div>
                  </div>
                  <p style={s.hint}>📂 Click to view materials →</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COURSE MATERIALS */}
        {activeTab === 'materials' && (
          <div>
            <div style={s.selectWrap}>
              <label style={s.label}>Select a course to view materials:</label>
              <select style={s.select}
                value={selectedCourseId || ''}
                onChange={(e) => setSelectedCourseId(e.target.value)}>
                <option value="" disabled>-- Choose a course --</option>
                {enrollments.map(e => (
                  <option key={e.courseId} value={e.courseId}>{e.courseTitle}</option>
                ))}
              </select>
            </div>
            {!selectedCourseId && <p style={s.empty}>Select a course to view its materials.</p>}
            {selectedCourseId && materials.length === 0 && <p style={s.empty}>No materials uploaded yet for this course.</p>}
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
          </div>
        )}

        {/* ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div>
            <div style={s.selectWrap}>
              <label style={s.label}>Select a course to view assignments:</label>
              <select style={s.select}
                value={selectedCourseId || ''}
                onChange={(e) => setSelectedCourseId(e.target.value)}>
                <option value="" disabled>-- Choose a course --</option>
                {enrollments.map(e => (
                  <option key={e.courseId} value={e.courseId}>{e.courseTitle}</option>
                ))}
              </select>
            </div>
            {!selectedCourseId && <p style={s.empty}>Select a course to see assignments.</p>}
            {selectedCourseId && assignments.length === 0 && <p style={s.empty}>No assignments for this course yet.</p>}
            <div style={s.grid}>
              {assignments.map(a => {
                const submitted = submissions.find(sub => sub.assignmentTitle === a.title);
                return (
                  <div key={a.id} style={s.assignCard}>
                    <div style={s.assignHeader}>
                      <h3 style={s.cardTitle}>{a.title}</h3>
                      <span style={{ ...s.badge, background: submitted ? '#e6f9ee' : '#fff3e0', color: submitted ? '#1D9E75' : '#e65100' }}>
                        {submitted ? '✅ Submitted' : '⏳ Pending'}
                      </span>
                    </div>
                    <p style={s.cardDesc}>{a.description}</p>
                    <p style={s.dueDate}>📅 Due: {a.dueDate}</p>
                    {!submitted && (
                      submitForm.assignmentId === a.id ? (
                        <form onSubmit={handleSubmit}>
                          <input style={s.input} placeholder="Paste your file/github URL" value={submitForm.fileUrl} onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })} required />
                          <div style={s.submitRow}>
                            <button type="submit" style={s.submitBtn}>Submit</button>
                            <button type="button" style={s.cancelBtn} onClick={() => setSubmitForm({ assignmentId: null, fileUrl: '' })}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button style={s.btn} onClick={() => setSubmitForm({ assignmentId: a.id, fileUrl: '' })}>Submit Assignment</button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div style={s.grid}>
            {submissions.length === 0 && <p style={s.empty}>No submissions yet.</p>}
            {submissions.map(sub => (
              <div key={sub.id} style={s.assignCard}>
                <div style={s.assignHeader}>
                  <h3 style={s.cardTitle}>{sub.assignmentTitle}</h3>
                  <span style={{ ...s.badge, background: sub.status === 'GRADED' ? '#e6f9ee' : '#fff3e0', color: sub.status === 'GRADED' ? '#1D9E75' : '#e65100' }}>
                    {sub.status === 'GRADED' ? '✅ Graded' : '⏳ Pending'}
                  </span>
                </div>
                {sub.marks !== null && (
                  <div style={s.marksBox}>
                    <span style={s.marksLabel}>Score</span>
                    <span style={s.marksVal}>{sub.marks}<span style={s.marksOf}>/100</span></span>
                  </div>
                )}
                {sub.feedback && <p style={s.feedback}>💬 {sub.feedback}</p>}
              </div>
            ))}
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
  pillRow: { display: 'flex', gap: '10px' },
  pill: { background: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: '#4a5568', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  toast: { color: '#fff', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  statNum: { fontSize: '32px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#8892b0' },
  progressCard: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' },
  progressItem: { marginBottom: '16px' },
  progressItemRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  progressCourseName: { fontSize: '13px', color: '#4a5568', fontWeight: '500' },
  progressLabel: { fontSize: '12px', color: '#8892b0' },
  progressPct: { fontSize: '12px', fontWeight: '700' },
  progressBg: { height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s ease' },
  searchWrap: { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', gap: '10px' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#1a1a2e', background: 'transparent' },
  clearBtn: { background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#8892b0' },
  searchResult: { fontSize: '13px', color: '#8892b0', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  cardTop: { padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  cardInitial: { width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700' },
  cardBody: { padding: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  cardDesc: { fontSize: '13px', color: '#8892b0', marginBottom: '10px', lineHeight: '1.5' },
  cardInst: { fontSize: '12px', color: '#4a5568', marginBottom: '12px' },
  ratingWrap: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' },
  ratingLabel: { fontSize: '12px', color: '#8892b0' },
  star: { fontSize: '20px', cursor: 'pointer' },
  btn: { width: '100%', padding: '10px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  hint: { fontSize: '12px', color: '#185FA5', fontWeight: '600', marginTop: '8px' },
  selectWrap: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' },
  select: { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '280px', background: '#fff' },
  materialCard: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' },
  materialIcon: { fontSize: '32px' },
  link: { fontSize: '13px', color: '#185FA5', textDecoration: 'none', fontWeight: '600' },
  assignCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  assignHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  badge: { fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' },
  dueDate: { fontSize: '12px', color: '#e65100', marginBottom: '14px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' },
  submitRow: { display: 'flex', gap: '8px' },
  submitBtn: { flex: 1, padding: '9px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '9px', background: '#fff', color: '#c62828', border: '1.5px solid #c62828', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  marksBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f7fa', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px' },
  marksLabel: { fontSize: '13px', color: '#8892b0' },
  marksVal: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e' },
  marksOf: { fontSize: '14px', color: '#8892b0', fontWeight: '400' },
  feedback: { fontSize: '13px', color: '#4a5568', lineHeight: '1.5', background: '#f5f7fa', padding: '10px', borderRadius: '8px' },
  empty: { color: '#8892b0', fontSize: '14px', padding: '10px 0' }
};

export default StudentDashboard;