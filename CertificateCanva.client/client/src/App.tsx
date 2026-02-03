import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import VerificationPage from './pages/VerificationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import UserAssets from './pages/user/UserAssets';
import UserProfile from './pages/user/UserProfile';
import CanvasEditorPage from './pages/user/CanvasEditorPage';

import './styles/global.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerificationPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />

          {/* User Routes */}
          <Route path="/user/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/user/assets" element={
            <ProtectedRoute><UserAssets /></ProtectedRoute>
          } />
          <Route path="/user/profile" element={
            <ProtectedRoute><UserProfile /></ProtectedRoute>
          } />
          <Route path="/canvas/:id" element={
            <ProtectedRoute><CanvasEditorPage /></ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
