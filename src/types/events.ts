export interface QueueEvent {
  visitor_id: number;
  position: number;
  message: string;
}

export interface VisitorPickupEventData {
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
} 