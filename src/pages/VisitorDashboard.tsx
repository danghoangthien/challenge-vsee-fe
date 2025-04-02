import React, { useEffect } from 'react';
import { useVisitor } from '../contexts/VisitorContext';
import QueueStatus from '../components/visitor/QueueStatus';
import JoinQueueForm from '../components/visitor/JoinQueueForm';
import ExaminationInfo from '../components/visitor/ExaminationInfo';
import ErrorPanel from '../components/visitor/ErrorPanel';
import WithAuthorized from '../components/common/WithAuthorized';
import { useAuth } from '../contexts/AuthContext';

const VisitorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchVisitorData, state } = useVisitor();
  const { statusMessage, examinationStatus, queueStatus } = state;
  console.log('statusMessage, examinationStatus, queueStatus', statusMessage, examinationStatus, queueStatus);
  useEffect(() => {
    fetchVisitorData();
  }, []);

  return (
    <WithAuthorized>
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
              {examinationStatus.isActive === false && queueStatus.isInQueue === false &&  user?.name  && (
                <JoinQueueForm />
              )}
            </div>
          </div>
        </div>
      </div>
    </WithAuthorized>
  );
};

export default VisitorDashboard; 