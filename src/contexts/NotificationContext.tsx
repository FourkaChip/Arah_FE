'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { dummyNotifications } from '@/constants/dummydata/notifications';
import {
  NotificationItem,
  NotificationFilters,
  NotificationTab,
  CategoryFilter, NotificationContextType, NotificationProviderProps
} from '@/types/notification';


const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


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