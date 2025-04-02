import React from 'react';
import { useProvider } from '../../contexts/ProviderContext';
import { useLoadingState } from '../../hooks/useLoadingState';
import PanelContainer from '../common/PanelContainer';
import PageLayout from '../common/PageLayout';

const ExamineDetail: React.FC = () => {
  const { state, completeExamination } = useProvider();
  const { examinationStatus } = state;
  const { currentExamination } = examinationStatus;
  const { isLoading, withLoading } = useLoadingState();

  if (!currentExamination) return null;

  const handleComplete = async () => {
    if (!currentExamination.visitor_id) return;
    await withLoading(async () => {
      await completeExamination(currentExamination.visitor_id!);
    });
  };

  const calculateDuration = () => {
    const startTime = new Date(currentExamination.started_at);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    return `${diffInMinutes} minutes`;
  };

  return (
    <PageLayout variant="stacked" className="md:grid-cols-1 lg:grid-cols-1">
      <PanelContainer
        header={{
          icon: <i className="bi bi-clock-history"></i>,
          title: "Current Examination"
        }}
      >
        <div className="flex flex-col bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3">
            <i className="bi bi-clock-history"></i> Examination in Progress!!
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid gap-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <label className="text-gray-600 font-medium">Visitor</label>
                  <span className="text-gray-900">{currentExamination.visitor_name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <label className="text-gray-600 font-medium">Start Time</label>
                  <span className="text-gray-900">{new Date(currentExamination.started_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <label className="text-gray-600 font-medium">Duration</label>
                  <span className="text-gray-900">{calculateDuration()}</span>
                </div>
                {currentExamination.reason && (
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <label className="text-gray-600 font-medium">Reason for Visit</label>
                    <span className="text-gray-900">{currentExamination.reason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 bg-vsee-green text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleComplete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Completing...</span>
                  </>
                ) : (
                  'Complete Examination'
                )}
              </button>
            </div>
          </div>
        </div>
      </PanelContainer>
    </PageLayout>
  );
};

export default ExamineDetail; 