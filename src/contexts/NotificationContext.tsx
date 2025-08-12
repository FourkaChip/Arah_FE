'use client';

import React, {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect,
    useCallback,
    useRef
} from 'react';
import {
    fetchNotificationList,
    fetchUnreadNotificationCount,
    markAllNotificationsAsRead,
    clearNotificationCache,
    ServerNotificationItem
} from '@/api/admin/noti/notiFetch';
import {
    NotificationItem,
    NotificationFilters,
    NotificationTab,
    CategoryFilter,
    NotificationContextType,
    NotificationProviderProps
} from '@/types/notification';
import { useNotificationSSE } from '@/hooks/useNotificationSSE';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 서버 데이터를 클라이언트 타입으로 변환하는 함수
const transformServerDataToClient = (serverItem: ServerNotificationItem): NotificationItem => {
    const categoryMap: Record<string, 'QnA' | 'Feedback'> = {
        QNA: 'QnA',
        FEEDBACK: 'Feedback',
        UPDATE: 'Feedback',
    };

    return {
        id: serverItem.id.toString(),
        category: categoryMap[serverItem.type] || 'Feedback',
        message: serverItem.content.description,
        isRead: serverItem.isRead,
        timestamp: formatTimestamp(serverItem.createdAt),
        createdAt: new Date(serverItem.createdAt),
    };
};

const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return '방금 전';
};

export function NotificationProvider({
                                         children,
                                         itemsPerPage = 5,
                                     }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [filters, setFilters] = useState<NotificationFilters>({
        tab: '전체',
        category: '전체',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);

    const latestReqRef = useRef(0);

    // 새 알림 수신 핸들러
    const handleNewNotification = useCallback((serverNotification: ServerNotificationItem) => {
        console.log('실시간 알림 수신:', serverNotification);

        setUnreadCount(prev => prev + 1);

        if ((filters.tab === '전체' || filters.tab === '읽지 않음') && currentPage === 1) {
            const newNotification = transformServerDataToClient(serverNotification);

            setNotifications(prev => {
                const exists = prev.some(item => item.id === newNotification.id);
                if (exists) return prev;

                const updated = [newNotification, ...prev].slice(0, itemsPerPage);
                return updated;
            });
        }

        clearNotificationCache();
        showNotificationToast?.(serverNotification);
    }, [filters.tab, currentPage, itemsPerPage]);

    // SSE 연결 설정
    const { isConnected, connectionError, reconnect } = useNotificationSSE({
        onNewNotification: handleNewNotification,
        onError: (error) => {
            console.error('SSE 연결 에러:', error);
        },
        onConnectionOpen: () => {
            console.log('실시간 알림 연결됨');
        },
        onConnectionClose: () => {
            console.log('실시간 알림 연결 종료');
        },
        autoReconnect: true,
        reconnectInterval: 5000
    });

    // 토스트 알림 표시 함수
    const showNotificationToast = useCallback((notification: ServerNotificationItem) => {
        if (Notification.permission === 'granted') {
            new Notification(`${notification.content.department}에서 알림`, {
                body: notification.content.description,
                icon: '/favicon.ico',
                tag: `notification-${notification.id}`
            });
        }
    }, []);

    // 브라우저 알림 권한 요청
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('알림 권한:', permission);
            });
        }
    }, []);

    // 페이지 데이터 로드 (페이지 이동 시 1회 호출)
    const loadPageData = useCallback(
        async (page: number) => {
            setIsLoading(true);
            const reqId = Date.now();
            latestReqRef.current = reqId;

            try {
                let isRead: boolean | undefined;
                if (filters.tab === '읽음') isRead = true;
                else if (filters.tab === '읽지 않음') isRead = false;

                const offset = (page - 1) * itemsPerPage;
                const response = await fetchNotificationList(isRead, offset);

                // 늦게 도착한 응답 무시
                if (latestReqRef.current !== reqId) return;

                if (response.success) {
                    const transformed = response.result.notificationResponseList.map(
                        transformServerDataToClient
                    );
                    setNotifications(transformed);
                    setHasNext(response.result.hasNext);

                    // 한 번의 응답 정보만으로 totalPages를 '확장'해서 계산
                    setTotalPages((prev) => {
                        if (transformed.length === 0) {
                            return Math.max(page - 1, 1);
                        }
                        return response.result.hasNext
                            ? Math.max(prev, page + 1)
                            : Math.max(prev, page);
                    });
                }
            } catch (error) {
                console.error('알림 목록 로드 실패:', error);
                setNotifications([]);
            } finally {
                setIsLoading(false);
            }
        },
        [filters.tab, itemsPerPage]
    );

    // 읽지 않은 알림 개수 로드
    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await fetchUnreadNotificationCount();
            if (response.success) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error('읽지 않은 알림 개수 로드 실패:', error);
        }
    }, []);

    // 필터링된 알림 목록 (카테고리만 클라에서 필터)
    const filteredNotifications = notifications.filter((notification) => {
        if (filters.category !== '전체') {
            return notification.category === filters.category;
        }
        return true;
    });

    // 서버에서 이미 페이징된 데이터이므로 그대로 사용
    const paginatedNotifications = filteredNotifications;

    // 핸들러
    const handleTabChange = useCallback((tab: NotificationTab) => {
        setFilters((prev) => ({ ...prev, tab }));
        setCurrentPage(1);
        // 탭 변경 시에는 캐시를 유지하되, 필요하다면 아래 주석 해제
        // clearNotificationCache();
    }, []);

    const handleCategoryChange = useCallback((category: string) => {
        setFilters((prev) => ({ ...prev, category: category as CategoryFilter }));
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback(
        (page: number) => {
            setCurrentPage(page);
            loadPageData(page); // ✅ 페이지 전환 시 한 번만 호출
        },
        [loadPageData]
    );

    const handleItemClick = useCallback((id: string) => {
        console.log('알림 ��릭:', id);
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            const response = await markAllNotificationsAsRead();
            if (response.success) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                );
                setUnreadCount(0);

                // 현재 페이지 데이터 다시 로드하여 최신 상태 반영
                loadPageData(currentPage);
            }
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
        }
    }, [currentPage, loadPageData]);

    // 초기 데이터 로드 및 탭 변경 시 재로드
    useEffect(() => {
        setCurrentPage(1);
        // ✅ 초기 스캔(checkInitialPagination) 제거
        setTotalPages(1); // 탭 바뀔 때 최소 1페이지로 초기화
        loadPageData(1);
    }, [filters.tab, loadPageData]);

    useEffect(() => {
        loadUnreadCount();
    }, [loadUnreadCount]);

    const contextValue: NotificationContextType = {
        notifications,
        filteredNotifications,
        paginatedNotifications,
        filters,
        currentPage,
        totalPages,
        unreadCount,
        handleTabChange,
        handleCategoryChange,
        handlePageChange,
        handleItemClick,
        handleMarkAllAsRead,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {connectionError && (
                <div className="sse-error-banner">
                    실시간 알림 연결에 문제가 있습니다.
                    <button onClick={reconnect}>재연결</button>
                </div>
            )}
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