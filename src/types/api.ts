// shared/types/api.ts - API and utility types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  message: string;
  status: number;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  field?: string;
  details?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: string | number | boolean | null;
}

// Utility Types
export interface FilterOptions<T = string> {
  label: string;
  value: T;
  count?: number;
}

export interface DateRange {
  start: string;
  end: string;
}

// Form Types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
}

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

export interface FileUploadResponse {
  filename: string;
  url: string;
  size: number;
  contentType: string;
}
