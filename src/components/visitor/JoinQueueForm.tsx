import React, { useState } from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import { useLoadingState } from '../../hooks/useLoadingState';
import './JoinQueueForm.css';
import { useAuth } from '../../contexts/AuthContext';

const JoinQueueForm: React.FC = () => {
  const { user } = useAuth();
  const { joinQueue } = useVisitor();
  const { isLoading, withLoading } = useLoadingState();
  const [name, setName] = useState(user?.name || '');
  const [reason, setReason] = useState('');
  const [vseeId, setVseeId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await withLoading(async () => {
      await joinQueue(vseeId, reason);
    });
  };

  

  return (
    <div className="waiting-room-container">
      <h1>Welcome to Code Challenge Waiting Room</h1>
      <p className="emergency-text">If this is an emergency, please call 911.</p>

      <div className="join-queue-form">
        <div className="provider-header">
          <i className="bi bi-camera-video"></i> Talk to one of Our Providers
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Review your name to proceed<span className="required">*</span></label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              disabled={true}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for visit <span className="optional">(optional)</span></label>
            <textarea
              id="reason"
              className="form-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Your reason for visit"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="vseeId">VSee ID<span className="required">*</span></label>
            <input
              type="text"
              id="vseeId"
              className="form-control"
              value={vseeId}
              onChange={(e) => setVseeId(e.target.value)}
              placeholder="your vsee id for doctor to call"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-enter-room"
            disabled={isLoading || !name.trim() || !vseeId.trim()}
          >
            {isLoading ? (
              <>
                <span 
                  className="spinner-border spinner-border-sm me-2" 
                  role="status" 
                  aria-hidden="true"
                />
                Joining...
              </>
            ) : (
              'Enter Waiting Room'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinQueueForm; 