import api from './api';
import { QueueResponse, QueueActionResponse } from '../types/queue';

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
  async joinQueue(visitorId: number): Promise<QueueActionResponse> {
    const response = await api.post<QueueActionResponse>('/visitor/lounge/queue', {
      visitor_id: visitorId,
    });
    return response.data;
  }

  async exitQueue(visitorId: number): Promise<QueueActionResponse> {
    const response = await api.delete<QueueActionResponse>('/visitor/lounge/queue', {
      data: { visitor_id: visitorId },
    });
    return response.data;
  }
}

export default QueueService.getInstance(); 