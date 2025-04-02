import React from 'react';
import { useProvider } from '../../contexts/ProviderContext';
import { Link } from 'react-router-dom';

const ErrorPanel: React.FC = () => {
  const { state } = useProvider();
  const { error } = state;

  if (!error) return null;

  return (
    <div className="alert alert-danger mb-4" role="alert">
      <p className="m-0">
        {error}
      </p>
    </div>
  );
};

export default ErrorPanel; 