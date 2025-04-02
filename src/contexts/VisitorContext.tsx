import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToChannel } from '../services/pusher';
import queueService from '../services/queue';
import examinationService from '../services/examination';
import { handleUnauthorizedError } from '../hooks/useAuthorization';
import { ExaminationDetail } from '../services/examination';

// Constants
export const VISITOR_EVENTS = {
  PICKED_UP: 'PICKED_UP',
  DROPPED_OFF: 'DROPPED_OFF',
  JOINED_QUEUE: 'JOINED_QUEUE',
  EXITED_QUEUE: 'EXITED_QUEUE',
  EXAMINATION_COMPLETED: 'EXAMINATION_COMPLETED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  UPDATE_QUEUE_STATUS: 'UPDATE_QUEUE_STATUS',
  UPDATE_EXAMINATION_STATUS: 'UPDATE_EXAMINATION_STATUS'
} as const;

// Types
interface QueueStatus {
  isInQueue: boolean;
  position: number | null;
  estimatedWaitTime: string | null;
  waitedTime: string | null;
  joinedAt: string | null;
}

interface ExaminationStatus {
  isActive: boolean;
  currentExamination: ExaminationDetail | null;
}

interface VisitorState {
  isAuthorized: boolean | null;
  queueStatus: QueueStatus;
  examinationStatus: ExaminationStatus;
  error: string | null;
  statusMessage: string;
  isLoading: boolean;
  loginUrl?: string;
  visitorId: number;
  visitorName: string;
}

interface QueueEventData {
  position: string;
  estimatedWaitTime: string;
  waitedTime: string | null;
  joinedAt: string | null;
}

interface ExaminationEventData {
  examination_id: string;
  provider_id: string;
  provider_name: string;
  started_at: string;
  duration: string;
  reason: string;
}

interface PickupEventData {
  provider: {
    id: number;
    name: string;
    email: string;
  };
  visitor: {
    id: number;
    name: string;
    email: string;
  };
  message: string;
  started_at: string;
  examination_id: number;
  reason: string;
}

interface VisitorContextType {
  state: VisitorState;
  fetchVisitorData: () => Promise<void>;
  joinQueue: (vseeId: string, reason: string) => Promise<void>;
  exitQueue: () => Promise<void>;
  clearError: () => void;
}

// Initial State
const initialState: VisitorState = {
  isAuthorized: null,
  queueStatus: {
    isInQueue: false,
    position: null,
    estimatedWaitTime: null,
    waitedTime: null,
    joinedAt: null,
  },
  examinationStatus: {
    isActive: false,
    currentExamination: null,
  },
  error: null,
  statusMessage: '',
  isLoading: false,
  loginUrl: undefined,
  visitorId: 0,
  visitorName: '',
};

// Context
const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

// Reducer
type VisitorAction =
  | { type: 'SET_AUTHORIZED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { message: string; loginUrl?: string } }
  | { type: 'SET_STATUS_MESSAGE'; payload: string }
  | { type: 'SET_QUEUE_STATUS'; payload: QueueStatus }
  | { type: 'SET_EXAMINATION_STATUS'; payload: ExaminationStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: typeof VISITOR_EVENTS.PICKED_UP; payload: PickupEventData }
  | { type: typeof VISITOR_EVENTS.DROPPED_OFF }
  | { type: typeof VISITOR_EVENTS.EXITED_QUEUE }
  | { type: typeof VISITOR_EVENTS.ERROR_OCCURRED; payload: string }
  | { type: typeof VISITOR_EVENTS.UPDATE_QUEUE_STATUS; payload: QueueEventData }
  | { type: typeof VISITOR_EVENTS.UPDATE_EXAMINATION_STATUS; payload: ExaminationEventData };

const visitorReducer = (state: VisitorState, action: VisitorAction): VisitorState => {
  const defaultQueueStatus: QueueStatus = {
    isInQueue: false,
    position: null,
    estimatedWaitTime: null,
    waitedTime: null,
    joinedAt: null,
  };

  const defaultExaminationStatus: ExaminationStatus = {
    isActive: false,
    currentExamination: null,
  };

  switch (action.type) {
    case 'SET_AUTHORIZED':
      return { ...state, isAuthorized: action.payload };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload.message,
        loginUrl: action.payload.loginUrl
      };
    case 'SET_STATUS_MESSAGE':
      return { ...state, statusMessage: action.payload };
    case 'SET_QUEUE_STATUS':
      return { ...state, queueStatus: action.payload };
    case 'SET_EXAMINATION_STATUS':
      return { ...state, examinationStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case VISITOR_EVENTS.PICKED_UP:
      const examination: ExaminationDetail = {
        examination_id: action.payload.examination_id,
        visitor_id: action.payload.visitor.id,
        visitor_name: action.payload.visitor.name,
        provider_id: action.payload.provider.id,
        provider_name: action.payload.provider.name,
        status: 'active',
        started_at: action.payload.started_at,
        duration: '0',
        reason: action.payload.reason,
      };
      return {
        ...state,
        examinationStatus: {
          isActive: true,
          currentExamination: examination
        },
        queueStatus: defaultQueueStatus,
        statusMessage: action.payload.message
      };
    case VISITOR_EVENTS.DROPPED_OFF:
    case VISITOR_EVENTS.ERROR_OCCURRED:
      return {
        ...state,
        ...(action.type === VISITOR_EVENTS.ERROR_OCCURRED ? { error: action.payload } : {}),
        examinationStatus: defaultExaminationStatus,
        queueStatus: defaultQueueStatus
      };
    case VISITOR_EVENTS.UPDATE_QUEUE_STATUS:
      return {
        ...state,
        queueStatus: {
          isInQueue: true,
          position: parseInt(action.payload.position, 10),
          estimatedWaitTime: action.payload.estimatedWaitTime,
          waitedTime: action.payload.waitedTime,
          joinedAt: action.payload.joinedAt,
        }
      };
    case VISITOR_EVENTS.UPDATE_EXAMINATION_STATUS:
      const updatedExamination: ExaminationDetail = {
        examination_id: parseInt(action.payload.examination_id, 10),
        visitor_id: state.visitorId,
        visitor_name: state.visitorName,
        provider_id: parseInt(action.payload.provider_id, 10),
        provider_name: action.payload.provider_name,
        status: 'active',
        started_at: action.payload.started_at,
        duration: action.payload.duration,
        reason: action.payload.reason,
      };
      return {
        ...state,
        examinationStatus: {
          isActive: true,
          currentExamination: updatedExamination
        }
      };
    default:
      return state;
  }
};

// Provider Component
export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [state, dispatch] = useReducer(visitorReducer, initialState);


  const fetchQueueStatus = useCallback(async () => {
    if (!user) return;
  
    try {
      const queueItem = await queueService.getQueueItem();
      if (queueItem) {
        dispatch({
          type: VISITOR_EVENTS.UPDATE_QUEUE_STATUS,
          payload: {
            position: String(queueItem.position),
            estimatedWaitTime: String(queueItem.estimated_wait_time),
            waitedTime:String(queueItem.waited_time),
            joinedAt:String(queueItem.joined_at)
          }
        });
      }
    } catch (error: any) {
      handleUnauthorizedError(error, logout, 'Failed to fetch queue status');
      dispatch({
        type: VISITOR_EVENTS.ERROR_OCCURRED,
        payload: 'Failed to fetch queue status'
      });
    }
  }, [user]);

  const fetchExaminationStatus = useCallback(async () => {
    if (!user) return;
  
    try {
      const examination = await examinationService.getVisitorExamination();
      if (examination && examination.status === 'in_progress') {
        dispatch({
          type: VISITOR_EVENTS.UPDATE_EXAMINATION_STATUS,
          payload: {
            examination_id: String(examination.examination_id),
            provider_id: String(examination.provider_id),
            provider_name: examination.provider_name,
            started_at: examination.started_at,
            duration: examination.duration,
            reason: examination.reason,
          }
        });
      }
    } catch (error: any) {
      handleUnauthorizedError(error, logout, 'Failed to fetch queue status');
      dispatch({
        type: VISITOR_EVENTS.ERROR_OCCURRED,
        payload: 'Failed to fetch examination status'
      });
    }
  }, [user]);

  const fetchVisitorData = useCallback(async () => {
    await fetchExaminationStatus();
    await fetchQueueStatus();
  }, [fetchExaminationStatus, fetchQueueStatus]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeExamination = subscribeToChannel(`visitor.${user.type_id}`, {
      'visitor.examination.pickedup': (data: PickupEventData) => {
        dispatch({ type: VISITOR_EVENTS.PICKED_UP, payload: data });
      },
      'visitor.examination.completed': () => {
        dispatch({ type: VISITOR_EVENTS.DROPPED_OFF });
      }
    });

    return () => {
      unsubscribeExamination();
    };
  }, [user]);

  const value = {
    state,
    fetchVisitorData,
    joinQueue: async (vseeId: string, reason: string) => {
      try {
        await queueService.joinQueue(vseeId, reason);
        await fetchQueueStatus();
      } catch (err: any) {
        dispatch({
          type: VISITOR_EVENTS.ERROR_OCCURRED,
          payload: 'Failed to join queue'
        });
      }
    },
    exitQueue: async () => {
      try {
        await queueService.exitQueue();
        dispatch({ type: 'SET_QUEUE_STATUS', payload: initialState.queueStatus });
        //dispatch({ type: VISITOR_EVENTS.EXITED_QUEUE });
      } catch (err: any) {
        dispatch({
          type: VISITOR_EVENTS.ERROR_OCCURRED,
          payload: 'Failed to exit queue'
        });
      }
    },
    clearError: () => {
      dispatch({
        type: VISITOR_EVENTS.ERROR_OCCURRED,
        payload: ''
      });
    }
  };

  return <VisitorContext.Provider value={value}>{children}</VisitorContext.Provider>;
};

// Hook
export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error('useVisitor must be used within a VisitorProvider');
  }
  return context;
};