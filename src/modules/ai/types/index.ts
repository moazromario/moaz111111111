export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AIAnalysisRequest {
  topic: 'inventory' | 'sales' | 'production' | 'general';
  dataPayload: any;
}

export interface AIAnalysisResponse {
  insights: string[];
  recommendations: string[];
  summary: string;
}
