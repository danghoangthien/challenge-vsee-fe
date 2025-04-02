import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface RoleBasedAuthProps {
  children: React.ReactNode;
  requiredRole: 'visitor' | 'provider';
  fallback?: React.ReactNode;
}

export const RoleBasedAuth: React.FC<RoleBasedAuthProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.type !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Access Denied</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-danger mb-0" role="alert">
                  You are not authorized to access this page. Please log in with a {requiredRole} account.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 