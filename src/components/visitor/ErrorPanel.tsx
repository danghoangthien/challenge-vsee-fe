import React from 'react';
import { Link } from 'react-router-dom';
import { useVisitor } from '../../contexts/VisitorContext';

const ErrorPanel: React.FC = () => {
  const { state } = useVisitor();

  if (!state.error) return null;

  return (
    <div className="alert alert-info alert-dismissible fade show" role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-info-circle-fill me-2"></i>
        <div>
          {state.error}
          {state.loginUrl && (
            <>
              {' '}
              <Link to={state.loginUrl} className="alert-link">
                Please log in
              </Link>
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      ></button>
    </div>
  );
};

export default ErrorPanel; 