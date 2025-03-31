import React, { useState } from 'react';
import { useVisitor } from '../../contexts/VisitorContext';

const JoinQueueForm: React.FC = () => {
  const { state, joinQueue } = useVisitor();
  const { isLoading } = state;
  const [vseeId, setVseeId] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinQueue(vseeId, reason);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Join Queue</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="vseeId" className="form-label">
              VSee ID
            </label>
            <input
              type="text"
              id="vseeId"
              className="form-control"
              value={vseeId}
              onChange={(e) => setVseeId(e.target.value)}
              placeholder="Enter your VSee ID"
              required
            />
          </div>
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
              required
            />
          </div>
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !vseeId.trim() || !reason.trim()}
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
        </form>
      </div>
    </div>
  );
};

export default JoinQueueForm; 