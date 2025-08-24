export interface KnowledgeBase {
  id: number;
  title: string;
  content: string;
  category: string;
  status: KnowledgeStatus;
  priority: Priority;
  authorId: number;
  authorName: string;
  authorEmail: string;
  lastModifiedById?: number;
  lastModifiedByName?: string;
  viewCount: number;
  version: number;
  createdAt: string;
  updatedAt?: string;
}

export interface KnowledgeBaseCreate {
  title: string;
  content: string;
  category: string;
  priority: Priority;
}

export interface KnowledgeBaseUpdate {
  title: string;
  content: string;
  category: string;
  status: KnowledgeStatus;
  priority: Priority;
}

export enum KnowledgeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface KnowledgeBaseFilter {
  status?: KnowledgeStatus;
  category?: string;
  priority?: Priority;
  search?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
