import React from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import { useLoadingState } from '../../hooks/useLoadingState';
import './ExaminationInfo.css';

const ExaminationInfo: React.FC = () => {
  const { state, exitExamination } = useVisitor();
  const { examinationStatus } = state;
  const { isLoading, withLoading } = useLoadingState();

  if (!examinationStatus.isActive) return null;

  const handleRelaunchVideo = () => {
    // TODO: Implement video relaunch logic
    console.log('Relaunching video...');
  };

  const handleExitExamination = async () => {
    const providerId = examinationStatus.currentExamination?.provider_id;
    if (!providerId) {
      console.error('No provider ID found');
      return;
    }

    await withLoading(async () => {
      await exitExamination(providerId);
    });
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
          <div className="provider-info">
            <h2 className="text-xl font-semibold mb-2">Dr. {examinationStatus.currentExamination?.provider_name}</h2>
            <p className="text-gray-600">Started at: {new Date(examinationStatus.currentExamination?.started_at || '').toLocaleTimeString()}</p>
            {examinationStatus.currentExamination?.duration && (
              <p className="text-gray-600">Duration: {examinationStatus.currentExamination.duration}</p>
            )}
          </div>

          <div className="relaunch-notice mt-4">
            If you close the video conference by mistake please,{' '}
            <button 
              onClick={handleRelaunchVideo}
              className="btn-link"
            >
              click here to relaunch video
            </button>{' '}
            again.
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleExitExamination}
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
                <>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Exit Examination
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationInfo; 