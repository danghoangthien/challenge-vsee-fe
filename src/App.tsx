import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProviderDashboard from './pages/ProviderDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={isLoginPage ? 'vh-100' : ''}>
      {!isLoginPage && user && (
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <a className="navbar-brand" href="/">
              <span className="v">V</span>See
            </a>
            <div className="navbar-nav ms-auto">
              <button 
                className="btn btn-outline-light" 
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/login');
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      <div className={`${isLoginPage ? '' : 'container mt-4'}`}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to={`/${user?.type}`} /> : <LoginPage />}
          />
          <Route
            path="/visitor"
            element={
              <ProtectedRoute allowedRoles={['visitor']}>
                <VisitorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={user ? <Navigate to={`/${user.type}`} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
