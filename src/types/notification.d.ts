export type NotificationCategory = 'QnA' | 'Feedback';
export type NotificationTab = '전체' | '읽음' | '안읽음';
export type CategoryFilter = '전체' | NotificationCategory;

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  message: string;
  isRead: boolean;
  timestamp: string;
  createdAt: Date;
}

export interface NotificationFilters {
  tab: NotificationTab;
  category: CategoryFilter;
}

export interface NotificationState {
  items: NotificationItem[];
  filteredItems: NotificationItem[];
  filters: NotificationFilters;
  currentPage: number;
}

// 상수 정의
export const NOTIFICATION_TABS: readonly NotificationTab[] = ['전체', '읽음', '안읽음'] as const;
export const NOTIFICATION_CATEGORIES: readonly CategoryFilter[] = ['전체', 'QnA', 'Feedback'] as const;
