import React from 'react';
import { useVisitor } from '../../contexts/VisitorContext';

const ErrorPanel: React.FC = () => {
  const { state, clearError } = useVisitor();
  const { error } = state;

  if (!error) return null;

  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      {error}
      <button
        type="button"
        className="btn-close"
        onClick={clearError}
        aria-label="Close"
      ></button>
    </div>
  );
};

export default ErrorPanel; 