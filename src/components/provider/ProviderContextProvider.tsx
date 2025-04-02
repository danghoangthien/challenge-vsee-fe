import React from 'react';
import { ProviderProvider } from '../../contexts/ProviderContext';
import { RoleBasedAuth } from '../auth/RoleBasedAuth';

interface ProviderContextProviderProps {
  children: React.ReactNode;
}

export const ProviderContextProvider: React.FC<ProviderContextProviderProps> = ({ children }) => {
  return (
    <RoleBasedAuth requiredRole="provider">
      <ProviderProvider>
        {children}
      </ProviderProvider>
    </RoleBasedAuth>
  );
}; 