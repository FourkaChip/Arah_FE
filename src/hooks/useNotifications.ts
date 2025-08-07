import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  NotificationItem,
  NotificationFilters,
  NotificationTab,
  CategoryFilter, UseNotificationsProps, UseNotificationsReturn
} from '@/types/notification';


export function useNotifications({ 
  initialData, 
  itemsPerPage = 5 
}: UseNotificationsProps): UseNotificationsReturn {
  
  // 초기 데이터 정렬
  const sortedInitialData = useMemo(() => 
    [...initialData].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), [initialData]
  );

  // 상태 관리
  const [notifications, setNotifications] = useState<NotificationItem[]>(sortedInitialData);
  const [filters, setFilters] = useState<NotificationFilters>({
    tab: '전체',
    category: '전체'
  });
  const [currentPage, setCurrentPage] = useState(1);

  // 필터링된 알림 계산
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // 탭 필터링
    if (filters.tab === '읽음') {
      result = result.filter(n => n.isRead);
    } else if (filters.tab === '읽지 않음') {
      result = result.filter(n => !n.isRead);
    }

    // 카테고리 필터링
    if (filters.category !== '전체') {
      result = result.filter(n => n.category === filters.category);
    }

    return result;
  }, [notifications, filters]);

  // 페이지네이션된 알림 계산
  const paginatedNotifications = useMemo(() => 
    filteredNotifications.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [filteredNotifications, currentPage, itemsPerPage]
  );

  // 총 페이지 수 계산
  const totalPages = useMemo(() => 
    Math.ceil(filteredNotifications.length / itemsPerPage),
    [filteredNotifications.length, itemsPerPage]
  );

  // 안읽음 개수 계산
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  // 필터나 카테고리 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.tab, filters.category]);

  // 현재 페이지에 알림이 없을 때 이전 페이지로 이동
  useEffect(() => {
    if (filteredNotifications.length > 0 && paginatedNotifications.length === 0 && currentPage > 1) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [filteredNotifications.length, paginatedNotifications.length, currentPage, totalPages]);

  // 이벤트 핸들러들
  const handleTabChange = useCallback((tab: NotificationTab) => {
    setFilters(prev => ({ ...prev, tab }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    // 타입 안전성을 위해 검증
    const validCategory = (category === 'QnA' || category === 'Feedback') ? category : '전체';
    setFilters(prev => ({ ...prev, category: validCategory as CategoryFilter }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemClick = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      return updated.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      return updated.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, []);

  return {
    // 상태
    notifications,
    filteredNotifications,
    paginatedNotifications,
    filters,
    currentPage,
    totalPages,
    unreadCount,
    
    // 액션
    handleTabChange,
    handleCategoryChange,
    handlePageChange,
    handleItemClick,
    handleMarkAllAsRead,
  };
}