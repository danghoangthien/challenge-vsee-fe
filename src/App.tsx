import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProviderDashboard from './pages/ProviderDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import { VisitorContextProvider } from './components/visitor/VisitorContextProvider';
import { ProviderContextProvider } from './components/provider/ProviderContextProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.type)) {
    // Don't redirect to login if user is authenticated but unauthorized
    return <>{children}</>;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoginPage = location.pathname === '/login';

  // If user is on the login page and they're already logged in,
  // only redirect if they're not coming from a protected route
  React.useEffect(() => {
    if (user && isLoginPage && !location.state?.from) {
      navigate(`/${user.type}`);
    }
  }, [user, isLoginPage, navigate]);

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
              <VisitorContextProvider>
                <VisitorDashboard />
              </VisitorContextProvider>
            }
          />
          <Route
            path="/provider"
            element={
              <ProviderContextProvider>
                <ProviderDashboard />
              </ProviderContextProvider>
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
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
