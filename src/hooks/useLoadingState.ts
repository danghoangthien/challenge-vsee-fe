import { useState, useCallback } from 'react';

export const useLoadingState = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState<boolean>(initialState);

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    withLoading,
  };
}; 