import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Editor = lazy(() => import('./components/Editor'));
const PensPage = lazy(() => import('./pages/PensPage'));
const PreviewPage = lazy(() => import('./pages/PreviewPage'));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={null}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/p/:id" element={<PreviewPage />} />
      <Route
        path="/pens"
        element={
          <PrivateRoute>
            <PensPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/editor"
        element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/pens" />} />
    </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
