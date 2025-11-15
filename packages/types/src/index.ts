// Health check types
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: boolean;
    redis: boolean;
    storage: boolean;
  };
}

// WebSocket message types
export interface WSMessage {
  type: string;
  data: any;
}

export interface WSHealthMessage extends WSMessage {
  type: 'health';
  data: HealthResponse;
}

// API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// User types (placeholder for future use)
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Print job types (placeholder for future use)
export interface PrintJob {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url: string;
  created_at: string;
  updated_at: string;
}

