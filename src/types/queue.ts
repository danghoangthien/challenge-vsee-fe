export interface QueueVisitor {
  position: number;
  visitor_id: number;
  visitor_name: string;
  reason?: string;
  waiting_time: string;
  email?: string;
}

export interface QueueItem {
  position: number;
  joined_at: string;
  waited_time: string;
  estimated_wait_time: string;
  total_visitors: number;
}

export interface QueueResponse {
  success: boolean;
  data: {
    total: number;
    visitors: QueueVisitor[];
  };
}

export interface QueueActionResponse {
  success: boolean;
  data?: {
    position?: number;
    message?: string;
    visitor_id?: number;
    visitor_name?: string;
    waited_time?: string;
    examination_duration?: string;
  };
  message?: string;
}

export interface QueueEvent {
  visitor_id: number;
  visitor_name: string;
  position: number;
  joined_at?: string;
  waited_time?: string;
  provider_name?: string;
  examination_id?: number;
  provider_id?: number;
  started_at?: string;
  completed_at?: string;
  duration?: string;
  message?: string;
} 