'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { dummyNotifications } from '@/constants/dummydata/notifications';
import { 
  NotificationItem, 
  NotificationFilters, 
  NotificationTab, 
  CategoryFilter 
} from '@/types/notification';

interface NotificationContextType {
  // 상태
  notifications: NotificationItem[];
  filteredNotifications: NotificationItem[];
  paginatedNotifications: NotificationItem[];
  filters: NotificationFilters;
  currentPage: number;
  totalPages: number;
  unreadCount: number;
  
  // 액션
  handleTabChange: (tab: NotificationTab) => void;
  handleCategoryChange: (category: string) => void;
  handlePageChange: (page: number) => void;
  handleItemClick: (id: string) => void;
  handleMarkAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export function NotificationProvider({ 
  children, 
  itemsPerPage = 5 
}: NotificationProviderProps) {
  const notificationState = useNotifications({
    initialData: dummyNotifications,
    itemsPerPage
  });

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}