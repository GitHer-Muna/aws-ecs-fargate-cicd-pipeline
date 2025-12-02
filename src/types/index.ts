export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketFilters extends PaginationQuery {
  status?: string;
  priority?: string;
  assignedToId?: string;
  createdById?: string;
  search?: string;
  category?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: string;
  category?: string;
  tags?: string[];
  dueDate?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  category?: string;
  tags?: string[];
  assignedToId?: string;
  dueDate?: string;
}

export interface CreateCommentRequest {
  content: string;
  isInternal?: boolean;
}
