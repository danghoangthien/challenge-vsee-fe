import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToChannel } from '../services/pusher';
import queueService from '../services/queue';
import examinationService from '../services/examination';
import { QueueEvent, VisitorPickupEventData } from '../types/events';

// Constants
export const VISITOR_EVENTS = {
  PICKED_UP: 'PICKED_UP',
  DROPPED_OFF: 'DROPPED_OFF',
  JOINED_QUEUE: 'JOINED_QUEUE',
  EXITED_QUEUE: 'EXITED_QUEUE',
  EXAMINATION_COMPLETED: 'EXAMINATION_COMPLETED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  UPDATE_QUEUE_STATUS: 'UPDATE_QUEUE_STATUS',
  UPDATE_EXAMINATION_STATUS: 'UPDATE_EXAMINATION_STATUS',
} as const;

// Types
export interface QueueStatus {
  isInQueue: boolean;
  position?: number;
  joinedAt?: string;
  waitedTime?: string;
  estimatedWaitTime?: string;
  totalVisitors?: number;
}

export interface ExaminationStatus {
  isActive: boolean;
  providerName?: string;
  providerId?: number;
  examinationId?: number;
  startedAt?: string;
  duration?: string;
}

export interface VisitorState {
  queueStatus: QueueStatus;
  examinationStatus: ExaminationStatus;
  error: string | null;
  statusMessage: string;
  isLoading: boolean;
}

interface VisitorContextType {
  state: VisitorState;
  joinQueue: (vseeId: string, reason: string) => Promise<void>;
  exitQueue: () => Promise<void>;
  clearError: () => void;
}

// Initial State
const initialState: VisitorState = {
  queueStatus: {
    isInQueue: false,
  },
  examinationStatus: {
    isActive: false,
  },
  error: null,
  statusMessage: '',
  isLoading: false,
};

// Context
const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

// Reducer
type VisitorAction =
  | { type: typeof VISITOR_EVENTS.PICKED_UP; payload: VisitorPickupEventData }
  | { type: typeof VISITOR_EVENTS.DROPPED_OFF }
  | { type: typeof VISITOR_EVENTS.JOINED_QUEUE; payload: QueueStatus }
  | { type: typeof VISITOR_EVENTS.EXITED_QUEUE }
  | { type: typeof VISITOR_EVENTS.EXAMINATION_COMPLETED }
  | { type: typeof VISITOR_EVENTS.ERROR_OCCURRED; payload: string }
  | { type: typeof VISITOR_EVENTS.UPDATE_QUEUE_STATUS; payload: QueueStatus }
  | { type: typeof VISITOR_EVENTS.UPDATE_EXAMINATION_STATUS; payload: ExaminationStatus };

const visitorReducer = (state: VisitorState, action: VisitorAction): VisitorState => {
  switch (action.type) {
    case VISITOR_EVENTS.PICKED_UP:
      return {
        ...state,
        examinationStatus: {
          isActive: true,
          providerName: action.payload.provider.name,
          providerId: action.payload.provider.id,
          examinationId: action.payload.examination_id,
          startedAt: action.payload.started_at,
        },
        queueStatus: { isInQueue: false },
        statusMessage: `You are invited by ${action.payload.provider.name}. Your examination is in progress.`,
      };

    case VISITOR_EVENTS.DROPPED_OFF:
      return {
        ...state,
        examinationStatus: { isActive: false },
        statusMessage: 'Your examination has been completed.',
      };

    case VISITOR_EVENTS.JOINED_QUEUE:
      return {
        ...state,
        queueStatus: action.payload,
        examinationStatus: { isActive: false },
        statusMessage: 'Your provider will shortly be with you.',
        error: null,
      };

    case VISITOR_EVENTS.EXITED_QUEUE:
      return {
        ...state,
        queueStatus: { isInQueue: false },
        statusMessage: 'You have exited the queue.',
        error: null,
      };

    case VISITOR_EVENTS.EXAMINATION_COMPLETED:
      return {
        ...state,
        examinationStatus: { isActive: false },
        statusMessage: 'Your examination has been completed.',
      };

    case VISITOR_EVENTS.ERROR_OCCURRED:
      return {
        ...state,
        error: action.payload,
      };

    case VISITOR_EVENTS.UPDATE_QUEUE_STATUS:
      return {
        ...state,
        queueStatus: action.payload,
      };

    case VISITOR_EVENTS.UPDATE_EXAMINATION_STATUS:
      return {
        ...state,
        examinationStatus: action.payload,
        queueStatus: { isInQueue: false },
      };

    default:
      return state;
  }
};

// Provider Component
export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(visitorReducer, initialState);

  const fetchQueueStatus = async () => {
    try {
      const queueItem = await queueService.getQueueItem();
      if (queueItem) {
        dispatch({
          type: VISITOR_EVENTS.UPDATE_QUEUE_STATUS,
          payload: {
            isInQueue: true,
            position: queueItem.position,
            joinedAt: queueItem.joined_at,
            waitedTime: queueItem.waited_time,
            estimatedWaitTime: queueItem.estimated_wait_time,
            totalVisitors: queueItem.total_visitors,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: VISITOR_EVENTS.ERROR_OCCURRED,
        payload: 'Failed to fetch queue status',
      });
    }
  };

  const fetchExaminationStatus = async () => {
    try {
      const examination = await examinationService.getVisitorExamination();
      if (examination && examination.status === 'in_progress') {
        dispatch({
          type: VISITOR_EVENTS.UPDATE_EXAMINATION_STATUS,
          payload: {
            isActive: true,
            providerName: examination.provider_name,
            examinationId: examination.examination_id,
            startedAt: examination.started_at,
            duration: examination.duration,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: VISITOR_EVENTS.ERROR_OCCURRED,
        payload: 'Failed to fetch examination status',
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchInitialStatus = async () => {
      await fetchExaminationStatus();
      if (!state.examinationStatus.isActive) {
        await fetchQueueStatus();
      }
    };
    fetchInitialStatus();

    const unsubscribeExamination = subscribeToChannel(`visitor.${user.type_id}`, {
      'VisitorPickedUpEvent': async (data: VisitorPickupEventData) => {
        dispatch({ type: VISITOR_EVENTS.PICKED_UP, payload: data });
        await fetchExaminationStatus();
      },
      'VisitorExaminationCompletedEvent': () => {
        dispatch({ type: VISITOR_EVENTS.EXAMINATION_COMPLETED });
      },
      'VisitorExitedEvent': () => {
        dispatch({ type: VISITOR_EVENTS.DROPPED_OFF });
      },
    });

    const unsubscribeQueue = subscribeToChannel('lounge.queue', {
      'VisitorJoinedQueue': async (data: QueueEvent) => {
        if (data.visitor_id === user.type_id) {
          await fetchQueueStatus();
        }
      },
      'VisitorExitedQueue': (data: QueueEvent) => {
        if (data.visitor_id === user.type_id && !state.examinationStatus.isActive) {
          dispatch({ type: VISITOR_EVENTS.EXITED_QUEUE });
        }
      },
    });

    return () => {
      unsubscribeExamination();
      unsubscribeQueue();
    };
  }, [user]);

  const joinQueue = async (vseeId: string, reason: string) => {
    try {
      await queueService.joinQueue(vseeId, reason);
      // State will be updated by the VisitorJoinedQueue event
    } catch (err) {
      dispatch({
        type: VISITOR_EVENTS.ERROR_OCCURRED,
        payload: 'Failed to join queue',
      });
    }
  };

  const exitQueue = async () => {
    if (!user) return;
    try {
      await queueService.exitQueue(user.type_id);
      // State will be updated by the VisitorExitedQueue event
    } catch (err) {
      dispatch({
        type: VISITOR_EVENTS.ERROR_OCCURRED,
        payload: 'Failed to exit queue',
      });
    }
  };

  const clearError = () => {
    dispatch({
      type: VISITOR_EVENTS.ERROR_OCCURRED,
      payload: '',
    });
  };

  const value = {
    state,
    joinQueue,
    exitQueue,
    clearError,
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