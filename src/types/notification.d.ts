import {ReactNode} from "react";

export type NotificationCategory = 'QnA' | 'Feedback';
export type NotificationTab = '전체' | '읽음' | '읽지 않음';
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

export const NOTIFICATION_TABS: readonly NotificationTab[] = ['전체', '읽음', '읽지 않음'] as const;
export const NOTIFICATION_CATEGORIES: readonly CategoryFilter[] = ['전체', 'QnA', 'Feedback'] as const;

export interface NotificationProps {
    itemsPerPage?: number;
    className?: string;
}

export interface NotificationItemProps {
    item: NotificationItemType;
    onClick: (id: string) => void;
}

export interface NotificationListProps {
    items: NotificationItemType[];
    onItemClick: (id: string) => void;
}

export interface NotificationContextType {
    notifications: NotificationItem[];
    filteredNotifications: NotificationItem[];
    paginatedNotifications: NotificationItem[];
    filters: NotificationFilters;
    currentPage: number;
    totalPages: number;
    unreadCount: number;

    handleTabChange: (tab: NotificationTab) => void;
    handlePageChange: (page: number) => void;
    handleItemClick: (id: string) => void;
    handleMarkAllAsRead: () => void;
    refreshModalData?: () => Promise<void>;
}

export interface NotificationProviderProps {
    children: ReactNode;
    itemsPerPage?: number;
}

export interface UseNotificationsProps {
    initialData: NotificationItem[];
    itemsPerPage?: number;
}

export interface UseNotificationsReturn {
    notifications: NotificationItem[];
    filteredNotifications: NotificationItem[];
    paginatedNotifications: NotificationItem[];
    filters: NotificationFilters;
    currentPage: number;
    totalPages: number;
    unreadCount: number;

    handleTabChange: (tab: NotificationTab) => void;
    handlePageChange: (page: number) => void;
    handleItemClick: (id: string) => void;
    handleMarkAllAsRead: () => void;
}