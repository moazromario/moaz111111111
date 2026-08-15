export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'finance'
  | 'inventory'
  | 'purchasing'
  | 'sales'
  | 'production'
  | 'hr'
  | 'maintenance'
  | 'reports'
  | 'showroom'
  | 'accountant'
  | 'warehouse'
  | 'worker';

export interface UserPermissions {
  dashboard?: boolean;
  inventory?: boolean;
  production?: boolean;
  sales?: boolean;
  purchases?: boolean;
  finance?: boolean;
  hr?: boolean;
  reports?: boolean;
  settings?: boolean;
  users?: boolean;
  maintenance?: boolean;
  suppliers?: boolean;
  vehicles?: boolean;
  showroom?: boolean;
  canDelete?: boolean;
  [key: string]: boolean | undefined;
}

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AuditLogEntry extends BaseEntity {
  userId: string;
  userEmail: string;
  action: string;
  collectionName: string;
  documentId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
  lastDocId?: string;
}
