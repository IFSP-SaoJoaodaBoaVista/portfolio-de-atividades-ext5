// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import EntryPage          from './pages/EntryPage';
import TeacherDashboard   from './pages/teacher/TeacherDashboard';
import QuizList           from './pages/teacher/QuizList';
import QuizForm           from './pages/teacher/QuizForm';
import TeacherResults     from './pages/teacher/TeacherResults';
import StudentHome        from './pages/student/StudentHome';
import QuizPlay           from './pages/student/QuizPlay';
import StudentHistory     from './pages/student/StudentHistory';
import AdminDashboard     from './pages/admin/AdminDashboard';
import { NotFound }       from './pages/Misc';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* ── Teacher ──────────────────────────────────────────────── */}
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
          } />
          <Route path="/teacher/quizzes" element={
            <ProtectedRoute role="teacher"><QuizList /></ProtectedRoute>
          } />
          <Route path="/teacher/quizzes/new" element={
            <ProtectedRoute role="teacher"><QuizForm /></ProtectedRoute>
          } />
          <Route path="/teacher/quizzes/:quizId/edit" element={
            <ProtectedRoute role="teacher"><QuizForm /></ProtectedRoute>
          } />
          <Route path="/teacher/results" element={
            <ProtectedRoute role="teacher"><TeacherResults /></ProtectedRoute>
          } />

          {/* ── Student ──────────────────────────────────────────────── */}
          <Route path="/student" element={
            <ProtectedRoute role="student"><StudentHome /></ProtectedRoute>
          } />
          <Route path="/student/quiz/:quizId" element={
            <ProtectedRoute role="student"><QuizPlay /></ProtectedRoute>
          } />
          <Route path="/student/history" element={
            <ProtectedRoute role="student"><StudentHistory /></ProtectedRoute>
          } />

          {/* ── Admin ────────────────────────────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          {/* Admin can edit any quiz via teacher's QuizForm */}
          <Route path="/admin/quizzes/:quizId/edit" element={
            <ProtectedRoute role="admin"><QuizForm /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
