import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToChannel } from '../services/pusher';
import queueService from '../services/queue';
import { QueueEvent } from '../types/queue';

interface QueueStatus {
  isInQueue: boolean;
  position?: number;
  providerName?: string;
  message?: string;
}

const VisitorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    isInQueue: false,
  });
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    // Subscribe to visitor-specific events
    const unsubscribe = subscribeToChannel(`visitor.${user.type_id}`, {
      'VisitorPickedUpEvent': (data: QueueEvent) => {
        setQueueStatus({
          isInQueue: true,
          providerName: data.provider_name,
          message: `You are invited by ${data.provider_name}. Your examination is in progress.`,
        });
      },
      'VisitorExaminationCompletedEvent': (data: QueueEvent) => {
        setQueueStatus({
          isInQueue: false,
          message: 'Your examination has been completed.',
        });
      },
      'VisitorExitedEvent': (data: QueueEvent) => {
        setQueueStatus({
          isInQueue: false,
          message: 'You have exited the queue.',
        });
      },
    });

    // Subscribe to public queue events
    const unsubscribeQueue = subscribeToChannel('lounge.queue', {
      'VisitorJoinedQueue': (data: QueueEvent) => {
        if (data.visitor_id === user.type_id) {
          setQueueStatus({
            isInQueue: true,
            position: data.position,
            message: 'Your provider will shortly be with you.',
          });
        }
      },
      'VisitorExitedQueue': (data: QueueEvent) => {
        if (data.visitor_id === user.type_id) {
          setQueueStatus({
            isInQueue: false,
            message: 'You have exited the queue.',
          });
        }
      },
    });

    return () => {
      unsubscribe();
      unsubscribeQueue();
    };
  }, [user]);

  const handleJoinQueue = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await queueService.joinQueue(user.type_id);
      setQueueStatus({
        isInQueue: true,
        message: 'Your provider will shortly be with you.',
      });
    } catch (err) {
      setError('Failed to join queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitQueue = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await queueService.exitQueue(user.type_id);
      setQueueStatus({
        isInQueue: false,
        message: 'You have exited the queue.',
      });
    } catch (err) {
      setError('Failed to exit queue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="h2 mb-4">Visitor Dashboard</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {queueStatus.message && (
        <div className="alert alert-info" role="alert">
          {queueStatus.message}
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-8">
          {!queueStatus.isInQueue ? (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Join Queue</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="reason" className="form-label">
                    Reason for Visit
                  </label>
                  <textarea
                    id="reason"
                    className="form-control"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe the reason for your visit..."
                  />
                </div>
                <div className="d-grid">
                  <button
                    className="btn btn-primary"
                    onClick={handleJoinQueue}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Joining Queue...
                      </>
                    ) : (
                      'Join Queue'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
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
                {queueStatus.providerName && (
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Provider</h6>
                    <p className="lead">{queueStatus.providerName}</p>
                  </div>
                )}
                <div className="d-grid">
                  <button
                    className="btn btn-danger"
                    onClick={handleExitQueue}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard; 