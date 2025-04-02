import React, { useEffect } from 'react';
import { useProvider } from '../contexts/ProviderContext';
import QueueList from '../components/provider/QueueList';
import ExamineDetail from '../components/provider/ExamineDetail';
import ErrorPanel from '../components/provider/ErrorPanel';
import WithAuthorized from '../components/common/WithAuthorized';

const ProviderDashboard: React.FC = () => {
  const { state, fetchProviderData } = useProvider();
  const { examinationStatus, statusMessage } = state;

  useEffect(() => {
    fetchProviderData();
  }, []);

  return (
    <div className="dashboard-container">
      <WithAuthorized>
        <div className="container">
          <h1 className="h2 mb-4">Provider Dashboard</h1>

          <ErrorPanel />
          

          {statusMessage && (
            <div className="alert alert-info" role="alert">
              {statusMessage}
            </div>
          )}

          <div className="row">
            <div className="col-md-8">
              {examinationStatus.isActive === true && (
                <ExamineDetail />
              )}
              
            </div>
            <div className="col-md-8">
              <QueueList />
            </div>
          </div>
        </div>
      </WithAuthorized>
    </div>
  );
};

export default ProviderDashboard; 
