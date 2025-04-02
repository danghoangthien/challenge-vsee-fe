import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: 'stacked' | 'split' | 'sidebar' | 'three-columns';
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  variant = 'stacked',
  className = '',
}) => {
  const layoutClasses = {
    stacked: 'space-y-6 min-w-[480px]',
    split: 'grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-[768px]',
    sidebar: 'grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 min-w-[768px]',
    'three-columns': 'grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-[1024px]',
  };

  return (
    <div className={`container mx-auto p-6 overflow-x-auto ${layoutClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default PageLayout; 