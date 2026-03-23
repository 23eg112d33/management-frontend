import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  }
});

// Auth
export const registerUser = (data) => axios.post(`${BASE_URL}/auth/register`, data);
export const loginUser = (data) => axios.post(`${BASE_URL}/auth/login`, data);

// Courses
export const getApprovedCourses = () => axios.get(`${BASE_URL}/courses/all`, authHeaders());
export const getMyCourses = () => axios.get(`${BASE_URL}/courses/my`, authHeaders());
export const createCourse = (data) => axios.post(`${BASE_URL}/courses/create`, data, authHeaders());
export const getAllCourses = () => axios.get(`${BASE_URL}/courses/admin/all`, authHeaders());
export const updateCourseStatus = (id, status) => axios.put(`${BASE_URL}/courses/admin/status/${id}?status=${status}`, {}, authHeaders());

// Enrollments
export const enrollCourse = (courseId) => axios.post(`${BASE_URL}/enrollments/enroll/${courseId}`, {}, authHeaders());
export const getMyEnrollments = () => axios.get(`${BASE_URL}/enrollments/my`, authHeaders());

// Assignments
export const getAssignmentsByCourse = (courseId) => axios.get(`${BASE_URL}/assignments/course/${courseId}`, authHeaders());
export const createAssignment = (courseId, data) => axios.post(`${BASE_URL}/assignments/create/${courseId}`, data, authHeaders());

// Submissions
export const submitAssignment = (assignmentId, data) => axios.post(`${BASE_URL}/submissions/submit/${assignmentId}`, data, authHeaders());
export const getMySubmissions = () => axios.get(`${BASE_URL}/submissions/my`, authHeaders());
export const gradeSubmission = (submissionId, data) => axios.put(`${BASE_URL}/submissions/grade/${submissionId}`, data, authHeaders());
export const getSubmissionsByAssignment = (assignmentId) => axios.get(`${BASE_URL}/submissions/assignment/${assignmentId}`, authHeaders());

// Course Materials
export const addMaterial = (courseId, data) => axios.post(`${BASE_URL}/materials/add/${courseId}`, data, authHeaders());
export const getMaterialsByCourse = (courseId) => axios.get(`${BASE_URL}/materials/course/${courseId}`, authHeaders());