import React from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import './ExaminationInfo.css';

const ExaminationInfo: React.FC = () => {
  const { state, exitQueue } = useVisitor();
  const { examinationStatus } = state;

  if (!examinationStatus.isActive) return null;

  const handleRelaunchVideo = () => {
    // TODO: Implement video relaunch logic
    console.log('Relaunching video...');
  };

  return (
    <div className="waiting-room-container">
      <h1>Welcome to Code Challenge Examination Room</h1>
      <p className="emergency-text">If this is an emergency, please call 911.</p>
      <div className="examination-status">
        <div className="provider-header">
          <i className="bi bi-clock-history"></i> Connected with your provider
        </div>

        <div className="status-content">
          <h2>{"<Provider Info>"}</h2>
          <div className="relaunch-notice">
            If you close the video conference by mistake please,{' '}
            <button 
              onClick={handleRelaunchVideo}
              className="btn-link"
            >
              click here to relaunch video
            </button>{' '}
            again.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationInfo; 