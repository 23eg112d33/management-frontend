import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import AdminDashboard from './components/AdminDashboard';
import CourseMaterials from './components/CourseMaterials';

function App() {
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/materials/:courseId/:courseTitle" element={<CourseMaterials />} />
      </Routes>
    </Router>
  );
}

export default App;