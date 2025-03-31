import React from 'react';
import { useVisitor } from '../../contexts/VisitorContext';

const QueueStatus: React.FC = () => {
  const { state, exitQueue } = useVisitor();
  const { queueStatus, isLoading } = state;

  if (!queueStatus.isInQueue) return null;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Queue Status</h5>
      </div>
      <div className="card-body">
        {queueStatus.position && (
          <div className="mb-4 text-center">
            <h6 className="text-muted mb-2">Your Position</h6>
            <h2 className="display-4">{queueStatus.position}</h2>
          </div>
        )}
        {queueStatus.totalVisitors && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Total Visitors in Queue</h6>
            <p className="lead mb-0">{queueStatus.totalVisitors}</p>
          </div>
        )}
        {queueStatus.waitedTime && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Waited Time</h6>
            <p className="lead mb-0">{queueStatus.waitedTime}</p>
          </div>
        )}
        {queueStatus.estimatedWaitTime && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Estimated Wait Time</h6>
            <p className="lead mb-0">{queueStatus.estimatedWaitTime}</p>
          </div>
        )}
        {queueStatus.joinedAt && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Joined At</h6>
            <p className="lead mb-0">
              {new Date(queueStatus.joinedAt).toLocaleString()}
            </p>
          </div>
        )}
        <div className="d-grid">
          <button
            className="btn btn-danger"
            onClick={exitQueue}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Exiting Queue...
              </>
            ) : (
              'Exit Queue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus; 