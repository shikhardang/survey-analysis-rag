// types.ts

export interface DataItem {
  [key: string]: string | number | null;
}

export interface DataSummary {
  columns: string[];
  data_summary: DataItem[];
}

export interface SourceData {
  [datasetName: string]: DataSummary;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  reply: string;
  source_data: SourceData | null;
}
