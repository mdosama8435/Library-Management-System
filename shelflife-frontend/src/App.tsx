import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';

// Page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import IssueBook from './pages/IssueBook';
import Members from './pages/Members';
import MemberHistory from './pages/MemberHistory';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected librarian routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="issue-book" element={<IssueBook />} />
              <Route path="members" element={<Members />} />
              <Route path="members/:memberId/history" element={<MemberHistory />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
