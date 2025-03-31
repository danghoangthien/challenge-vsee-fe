import api from './api';
import { QueueResponse, QueueActionResponse } from '../types/queue';

export interface QueueItem {
  position: number;
  joined_at: string;
  waited_time: string;
  estimated_wait_time: string;
  total_visitors: number;
}

class QueueService {
  private static instance: QueueService;

  private constructor() {}

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  // Provider endpoints
  async getWaitingList(): Promise<QueueResponse> {
    const response = await api.get<QueueResponse>('/provider/lounge/list');
    return response.data;
  }

  async pickupVisitor(visitorId: number): Promise<QueueActionResponse> {
    const response = await api.post<QueueActionResponse>('/provider/lounge/pickup', {
      visitor_id: visitorId,
    });
    return response.data;
  }

  async dropoffVisitor(visitorId: number): Promise<QueueActionResponse> {
    const response = await api.post<QueueActionResponse>('/provider/lounge/dropoff', {
      visitor_id: visitorId,
    });
    return response.data;
  }

  // Visitor endpoints
  async joinQueue(vseeId: string, reason: string): Promise<void> {
    await api.post('/visitor/lounge/queue', { vsee_id: vseeId, reason });
  }

  async exitQueue(visitorId: number): Promise<void> {
    await api.delete(`/visitor/lounge/queue/${visitorId}`);
  }

  async getQueueItem(): Promise<QueueItem | null> {
    try {
      const response = await api.get('/visitor/lounge/queueItem');
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export default QueueService.getInstance(); 