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
  const buttonStyle = "w-12 h-12 flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors";
  const iconStyle = "text-xl";

  return (
    <div className="flex items-center gap-2">
      <button
        className={buttonStyle}
        title="Chat"
        onClick={(e) => {
          e.stopPropagation();
          onChat?.();
        }}
      >
        <i className={`bi bi-chat-fill ${iconStyle}`}></i>
      </button>
      <button
        className={buttonStyle}
        title="Video call"
        onClick={(e) => {
          e.stopPropagation();
          onVideoCall?.();
        }}
      >
        <i className={`bi bi-camera-video-fill ${iconStyle}`}></i>
      </button>
      <button
        className={buttonStyle}
        title="More options"
        onClick={(e) => {
          e.stopPropagation();
          onMore?.();
        }}
      >
        <i className={`bi bi-three-dots ${iconStyle}`}></i>
      </button>
    </div>
  );
};

export default VisitorActionButtons; 