import React from 'react';
import { useVisitor } from '../contexts/VisitorContext';
import QueueStatus from '../components/visitor/QueueStatus';
import JoinQueueForm from '../components/visitor/JoinQueueForm';
import ExaminationInfo from '../components/visitor/ExaminationInfo';
import ErrorPanel from '../components/visitor/ErrorPanel';

const VisitorDashboard: React.FC = () => {
  const { state } = useVisitor();
  const { statusMessage } = state;

  return (
    <div className="dashboard-container">
      <div className="container">
        <h1 className="h2 mb-4">Visitor Dashboard</h1>

        <ErrorPanel />

        {statusMessage && (
          <div className="alert alert-info" role="alert">
            {statusMessage}
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-8">
            <ExaminationInfo />
            <QueueStatus />
            {!state.examinationStatus.isActive && !state.queueStatus.isInQueue && (
              <JoinQueueForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard; 