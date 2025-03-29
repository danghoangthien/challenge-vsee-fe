import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToChannel } from '../services/pusher';
import queueService from '../services/queue';
import { QueueVisitor, QueueEvent } from '../types/queue';

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<QueueVisitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<QueueVisitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await queueService.getWaitingList();
        setVisitors(response.data.visitors);
      } catch (err) {
        setError('Failed to fetch visitors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to provider-specific events
    const unsubscribe = subscribeToChannel(`provider.${user.type_id}`, {
      'ProviderPickedUpVisitorEvent': (data: QueueEvent) => {
        // Handle visitor pickup confirmation
        console.log('Visitor picked up:', data);
      },
      'ProviderExaminationCompletedEvent': (data: QueueEvent) => {
        // Handle examination completion
        console.log('Examination completed:', data);
      },
      'ProviderPostponeVisitorEvent': (data: QueueEvent) => {
        // Handle visitor postponement
        console.log('Visitor postponed:', data);
      },
    });

    // Subscribe to public queue events
    const unsubscribeQueue = subscribeToChannel('lounge.queue', {
      'VisitorJoinedQueue': (data: QueueEvent) => {
        // Add new visitor to the list
        setVisitors(prev => [...prev, {
          position: data.position,
          visitor_id: data.visitor_id,
          visitor_name: data.visitor_name,
          waiting_time: 'Just joined',
        }]);
      },
      'VisitorExitedQueue': (data: QueueEvent) => {
        // Remove visitor from the list
        setVisitors(prev => prev.filter(v => v.visitor_id !== data.visitor_id));
      },
    });

    return () => {
      unsubscribe();
      unsubscribeQueue();
    };
  }, [user]);

  const handlePickupVisitor = async (visitorId: number) => {
    try {
      await queueService.pickupVisitor(visitorId);
      setSelectedVisitor(null);
    } catch (err) {
      setError('Failed to pickup visitor');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h1 className="h2 mb-4">Provider Dashboard</h1>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Waiting Queue</h5>
            </div>
            <div className="card-body">
              {visitors.length === 0 ? (
                <p className="text-muted text-center">No visitors in queue</p>
              ) : (
                <div className="list-group">
                  {visitors.map((visitor) => (
                    <div
                      key={visitor.visitor_id}
                      className="list-group-item list-group-item-action"
                      onClick={() => setSelectedVisitor(visitor)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{visitor.visitor_name}</h6>
                          <small className="text-muted">
                            Position: {visitor.position} | Waiting: {visitor.waiting_time}
                          </small>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePickupVisitor(visitor.visitor_id);
                          }}
                        >
                          Invite
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Visitor Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedVisitor(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="fw-bold">Name:</label>
                  <p>{selectedVisitor.visitor_name}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Position:</label>
                  <p>{selectedVisitor.position}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Waiting Time:</label>
                  <p>{selectedVisitor.waiting_time}</p>
                </div>
                {selectedVisitor.reason && (
                  <div className="mb-3">
                    <label className="fw-bold">Reason:</label>
                    <p>{selectedVisitor.reason}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedVisitor(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handlePickupVisitor(selectedVisitor.visitor_id)}
                >
                  Invite
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard; 