import React from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import { useLoadingState } from '../../hooks/useLoadingState';
import './QueueStatus.css';

const QueueStatus: React.FC = () => {
  const { state, exitQueue } = useVisitor();
  const { queueStatus } = state;
  console.log('queueStatus', queueStatus);
  const { isLoading, withLoading } = useLoadingState();

  const handleExitQueue = async () => {
    await withLoading(async () => {
      await exitQueue();
    });
  };

  if (!queueStatus.isInQueue) return null;

  const formatJoinedAt = () => {
    if (!queueStatus.joinedAt) return 'N/A';
    return new Date(queueStatus.joinedAt).toLocaleTimeString();
  };

  return (
    <div className="waiting-room-container">
      <h1>Welcome to Code Challenge Waiting Room</h1>
      <p className="emergency-text">If this is an emergency, please call 911.</p>

      <div className="queue-status">
        <div className="provider-header">
          <i className="bi bi-clock-history"></i> Waiting for provider
        </div>

        <div className="status-content">
          <div className="queue-info">
            <div className="info-item">
              <label>Position in Queue</label>
              <span>{queueStatus.position || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Joined At</label>
              <span>{formatJoinedAt()}</span>
            </div>
            <div className="info-item">
              <label>Waited Time</label>
              <span>{queueStatus.waitedTime || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Estimated Wait Time</label>
              <span>{queueStatus.estimatedWaitTime || 'N/A'}</span>
            </div>
          </div>

          <button
            onClick={handleExitQueue}
            className="btn-exit-room"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span 
                  className="spinner-border spinner-border-sm me-2" 
                  role="status" 
                  aria-hidden="true"
                />
                Exiting...
              </>
            ) : (
              'Exit Waiting Room'
            )}
          </button>

          <div className="relaunch-notice">
            If you close the video conference by mistake please,{' '}
            <button className="btn-link">
              click here to relaunch video
            </button>{' '}
            again.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus; 