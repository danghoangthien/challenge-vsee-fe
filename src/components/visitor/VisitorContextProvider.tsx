import React from 'react';
import { VisitorProvider } from '../../contexts/VisitorContext';
import { RoleBasedAuth } from '../auth/RoleBasedAuth';

interface VisitorContextProviderProps {
  children: React.ReactNode;
}

export const VisitorContextProvider: React.FC<VisitorContextProviderProps> = ({ children }) => {
  return (
    <RoleBasedAuth requiredRole="visitor">
      <VisitorProvider>
        {children}
      </VisitorProvider>
    </RoleBasedAuth>
  );
}; 