import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToChannel } from '../services/pusher';
import queueService from '../services/queue';
import examinationService, { ExaminationDetail } from '../services/examination';
import { QueueVisitor } from '../types/queue';
import { handleUnauthorizedError } from '../hooks/useAuthorization';

interface QueueStatus {
  isInQueue: boolean | null;
  visitors: QueueVisitor[];
}

interface ExaminationStatus {
  isActive: boolean | null;
  currentExamination: ExaminationDetail | null;
}

interface ProviderState {
  isAuthorized: boolean | null;
  queueStatus: QueueStatus;
  examinationStatus: ExaminationStatus;
  statusMessage: string;
  error: string | null;
}

interface ProviderContextType {
  state: ProviderState;
  fetchProviderData: () => Promise<void>;
  pickupVisitor: (visitorId: number) => Promise<void>;
  completeExamination: (visitorId: number) => Promise<void>;
}

const initialState: ProviderState = {
  isAuthorized: null,
  queueStatus: {
    isInQueue: null,
    visitors: [],
  },
  examinationStatus: {
    isActive: null,
    currentExamination: null,
  },
  statusMessage: '',
  error: null,
};

type ProviderAction =
  | { type: 'SET_AUTHORIZED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { message: string; } }
  | { type: 'SET_STATUS_MESSAGE'; payload: string }
  | { type: 'SET_QUEUE_STATUS'; payload: QueueStatus }
  | { type: 'SET_EXAMINATION_STATUS'; payload: ExaminationStatus };

const providerReducer = (state: ProviderState, action: ProviderAction): ProviderState => {
  switch (action.type) {
    case 'SET_AUTHORIZED':
      return { ...state, isAuthorized: action.payload };
    case 'SET_ERROR':
      return { 
        ...state, 
      };
    case 'SET_STATUS_MESSAGE':
      return { ...state, statusMessage: action.payload };
    case 'SET_QUEUE_STATUS':
      return { ...state, queueStatus: action.payload };
    case 'SET_EXAMINATION_STATUS':
      return { ...state, examinationStatus: action.payload };
    default:
      return state;
  }
};

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const ProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(providerReducer, initialState);
  const { user, logout } = useAuth();

  const fetchExaminationStatus = useCallback(async () => {
    if (!user) return;
    try {
      const examination = await examinationService.getProviderExamination();
      if (examination && examination.status === 'in_progress') {
        dispatch({
          type: 'SET_EXAMINATION_STATUS',
          payload: {
            isActive: true,
            currentExamination: examination,
          },
        });
      } else {
        dispatch({
          type: 'SET_EXAMINATION_STATUS',
          payload: {
            isActive: false,
            currentExamination: null,
          },
        });
      }
    } catch (error: any) {
      handleUnauthorizedError(error, logout, 'Failed to fetch examination status');
    }
  }, [user]);

  const fetchProviderData = useCallback(async () => {
    if (!user) return;

    try {
      await fetchExaminationStatus();
      const response = await queueService.getWaitingList();
      dispatch({ 
        type: 'SET_QUEUE_STATUS', 
        payload: { 
          isInQueue: true,
          visitors: response.data.visitors 
        } 
      });
    } catch (error: any) {
      handleUnauthorizedError(error, logout, 'Failed to fetch examination status');
      dispatch({ 
        type: 'SET_QUEUE_STATUS', 
        payload: { 
          isInQueue: false,
          visitors: [] 
        } 
      });
    }
  }, [user]);

  const pickupVisitor = useCallback(async (visitorId: number) => {
    if (!user) return;

    try {
      await queueService.pickupVisitor(visitorId);
      await fetchExaminationStatus();
      dispatch({ type: 'SET_STATUS_MESSAGE', payload: 'Visitor picked up successfully' });
    } catch (error: any) {
      handleUnauthorizedError(error, logout, 'Failed to pickup visitor');
    }
  }, [user]);

  const completeExamination = useCallback(async (visitorId: number) => {
    if (!user) return;

    try {
      await queueService.completeExamination(visitorId);
      dispatch({ 
        type: 'SET_EXAMINATION_STATUS', 
        payload: { 
          isActive: false,
          currentExamination: null
        } 
      });
      dispatch({ type: 'SET_STATUS_MESSAGE', payload: 'Examination completed successfully' });
    } catch (error: any) {
      handleUnauthorizedError(error, logout, 'Failed to complete examination');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChannel(`provider.${user.type_id}`, {
      'provider.pickedup.visitor': async (data) => {
        console.log('catch provider.pickedup.visitor', true);
        await fetchExaminationStatus();
        const response = await queueService.getWaitingList();
        console.log('[getWaitingList]response', response)
        dispatch({ 
          type: 'SET_QUEUE_STATUS', 
          payload: { 
            isInQueue: true,
            visitors: response.data.visitors 
          } 
        });
      },
      'provider.completed.examination': () => {
        dispatch({
          type: 'SET_EXAMINATION_STATUS',
          payload: {
            isActive: false,
            currentExamination: null,
          },
        });
      },
    });

    const unsubscribeQueue = subscribeToChannel('lounge.queue', {
      'visitor.joined.queue': async () => {
        console.log('catch visitor.joined.queue', true);
        const response = await queueService.getWaitingList();
        dispatch({ 
          type: 'SET_QUEUE_STATUS', 
          payload: { 
            isInQueue: true,
            visitors: response.data.visitors 
          } 
        });
      },
      'visitor.exited.queue': async () => {
        console.log('catch visitor.exited.queue', true);
        const response = await queueService.getWaitingList();
        dispatch({ 
          type: 'SET_QUEUE_STATUS', 
          payload: { 
            isInQueue: true,
            visitors: response.data.visitors 
          } 
        });
      },
    });

    return () => {
      unsubscribe();
      unsubscribeQueue();
    };
  }, [user]);

  const value = {
    state,
    fetchProviderData,
    pickupVisitor,
    completeExamination,
  };

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
};

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}; 