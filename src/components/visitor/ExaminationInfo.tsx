import React from 'react';
import { useVisitor } from '../../contexts/VisitorContext';

const ExaminationInfo: React.FC = () => {
  const { state } = useVisitor();
  const { examinationStatus } = state;

  if (!examinationStatus.isActive) return null;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Examination in Progress</h5>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <h6 className="text-muted mb-2">Provider</h6>
          <p className="lead mb-0">{examinationStatus.providerName}</p>
        </div>
        {examinationStatus.startedAt && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Started At</h6>
            <p className="lead mb-0">
              {new Date(examinationStatus.startedAt).toLocaleString()}
            </p>
          </div>
        )}
        {examinationStatus.duration && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Duration</h6>
            <p className="lead mb-0">{examinationStatus.duration}</p>
          </div>
        )}
        {examinationStatus.examinationId && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Examination ID</h6>
            <p className="lead mb-0">{examinationStatus.examinationId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminationInfo; 