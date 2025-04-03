import React from 'react';

interface VisitorActionButtonsProps {
  onChat?: () => void;
  onVideoCall?: () => void;
  onMore?: () => void;
}

const VisitorActionButtons: React.FC<VisitorActionButtonsProps> = ({
  onChat,
  onVideoCall,
  onMore
}) => {
  const activeButtonStyle = "w-12 h-12 flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors relative group focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2";
  const disabledButtonStyle = "w-12 h-12 flex items-center justify-center bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed relative group focus:outline-none";
  const iconStyle = "text-xl";
  const tooltipStyle = "absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full mb-2 px-3 py-1 text-sm text-white bg-gray-900 rounded-md whitespace-nowrap left-1/2 transform -translate-x-1/2 transition-all duration-200";
  const tooltipArrowStyle = "absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900";

  return (
    <div className="flex items-center gap-2">
      <button
        className={disabledButtonStyle}
        disabled
        onClick={(e) => {
          e.stopPropagation();
          onChat?.();
        }}
      >
        <i className={`bi bi-chat-fill ${iconStyle}`}></i>
        <div className={tooltipStyle}>
          Chat (Coming Soon)
          <div className={tooltipArrowStyle}></div>
        </div>
      </button>
      <button
        className={activeButtonStyle}
        onClick={(e) => {
          e.stopPropagation();
          onVideoCall?.();
        }}
      >
        <i className={`bi bi-camera-video-fill ${iconStyle}`}></i>
        <div className={tooltipStyle}>
          Video call
          <div className={tooltipArrowStyle}></div>
        </div>
      </button>
      <button
        className={disabledButtonStyle}
        disabled
        onClick={(e) => {
          e.stopPropagation();
          onMore?.();
        }}
      >
        <i className={`bi bi-three-dots ${iconStyle}`}></i>
        <div className={tooltipStyle}>
          More options (Coming Soon)
          <div className={tooltipArrowStyle}></div>
        </div>
      </button>
    </div>
  );
};

export default VisitorActionButtons; 