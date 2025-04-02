import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UnauthorizedPanelProps {
  children: React.ReactNode;
}

const WithAuthorized: React.FC<UnauthorizedPanelProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card mt-5">
              <div className="card-body text-center">
                <h3 className="card-title text-danger mb-4">Unauthorized Access</h3>
                <p className="card-text">
                  You are not authorized to access the provider dashboard.{' '}
                  <a href="/login" className="alert-link" onClick={handleLoginClick}>
                    Please log in with a visitor account
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default WithAuthorized; 