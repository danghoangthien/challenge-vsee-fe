import React from 'react';

interface HeaderProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

interface PanelContainerProps {
  children: React.ReactNode;
  header?: HeaderProps;
  className?: string;
}

const PanelContainer: React.FC<PanelContainerProps> = ({
  children,
  header,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {header && (
        <div className={`bg-[var(--vsee-green)] px-4 sm:px-6 py-4 ${header.className || ''}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              {header.icon && <span className="text-2xl text-white flex-shrink-0">{header.icon}</span>}
              {header.title && (
                <h1 className="m-0 text-lg sm:text-2xl font-semibold text-white font-sans truncate">
                  {header.title}
                </h1>
              )}
            </div>
            {header.rightContent && (
              <div className="flex items-center ml-4 flex-shrink-0">{header.rightContent}</div>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default PanelContainer; 