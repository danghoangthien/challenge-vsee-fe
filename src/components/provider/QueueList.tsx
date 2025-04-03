import React, { useState } from 'react';
import { useProvider } from '../../contexts/ProviderContext';
import { useLoadingState } from '../../hooks/useLoadingState';
import { QueueVisitor } from '../../types/queue';
import PanelContainer from '../common/PanelContainer';
import PageLayout from '../common/PageLayout';
import VisitorActionButtons from '../visitor/VisitorActionButtons';

const QueueList: React.FC = () => {
  const { state, pickupVisitor } = useProvider();
  const { queueStatus , error } = state;
  const { isLoading, withLoading } = useLoadingState();
  const [selectedVisitor, setSelectedVisitor] = useState<QueueVisitor | null>(null);

  const handlePickup = async (visitorId: number) => {
    await withLoading(async () => {
      await pickupVisitor(visitorId);
      setSelectedVisitor(null);
    });
  };

  const inviteButton = (
    <button className="px-4 py-2 bg-vsee-green text-white rounded-lg hover:bg-opacity-90 hover:ring-2 hover:ring-white transition-all flex items-center gap-2 focus:outline-none focus:ring-0">
      <i className="bi bi-person-plus"></i> Invite people
    </button>
  );

  // Show loading state while queue status is being checked
  if (queueStatus.isInQueue === null) {
    return (
      <PageLayout variant="stacked">
        <PanelContainer
          className="mt-4"
          header={{
            title: "Waiting Room",
            rightContent: inviteButton
          }}
        >
          <div className="flex justify-center items-center p-8">
            <div className="inline-block w-8 h-8 border-4 border-vsee-green border-t-transparent rounded-full animate-spin">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </PanelContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="stacked" className="md:grid-cols-1 lg:grid-cols-1">
      <PanelContainer
        header={{
          icon: <i className="bi bi-list"></i>,
          title: "Waiting Room",
          rightContent: inviteButton
        }}
      >
        <div className="p-6">
          {queueStatus.visitors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No visitors in queue</div>
          ) : (
            <div className="space-y-4">
              {queueStatus.visitors.map((visitor) => (
                <div
                  key={visitor.visitor_id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
                  onClick={() => setSelectedVisitor(visitor)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl text-gray-400">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold text-gray-900">{visitor.visitor_name}</h2>
                      <p className="text-sm text-gray-600 mt-1">{visitor.reason}</p>
                      <p className="text-sm text-gray-500">{visitor.email}</p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <i className="bi bi-camera-video-fill"></i> Online
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <i className="bi bi-clock"></i> Waiting: {visitor.waiting_time || '0 min'}
                          </span>
                        </div>
                        
                        <VisitorActionButtons
                          onChat={() => {
                            // Handle chat
                          }}
                          onVideoCall={() => handlePickup(visitor.visitor_id)}
                          onMore={() => setSelectedVisitor(visitor)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PanelContainer>

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Visitor Details</h2>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  onClick={() => setSelectedVisitor(null)}
                >
                  <i className="bi bi-x text-xl"></i>
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-5xl text-gray-400">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedVisitor.visitor_name}</h3>
                    <p className="text-gray-600 mt-1">{selectedVisitor.email}</p>
                    <p className="text-gray-700 mt-2">{selectedVisitor.reason}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Online
                      </span>
                      <span className="text-sm text-gray-600">
                        Waiting: {selectedVisitor.waiting_time || '0 min'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                <button 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none"
                  onClick={() => setSelectedVisitor(null)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-vsee-green text-white rounded-lg hover:bg-opacity-90 hover:ring-2 hover:ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none"
                  onClick={() => handlePickup(selectedVisitor.visitor_id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    'Start Video Call'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default QueueList; 