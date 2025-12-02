export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'WAITING_ON_THIRD_PARTY' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  dueDate?: string;
  createdBy: User;
  assignedTo?: User;
  _count?: {
    comments: number;
    attachments: number;
  };
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  createdAt: string;
  uploadedBy: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: string;
  category?: string;
  tags?: string[];
  dueDate?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  category?: string;
  tags?: string[];
  assignedToId?: string;
  dueDate?: string;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  priority?: string;
  search?: string;
  category?: string;
  tags?: string[];
}

export interface TicketStats {
  total: number;
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  byPriority: {
    high: number;
    critical: number;
  };
}
