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
import {usePathname} from 'next/navigation';
import {
    fetchNotificationList,
    fetchUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    clearNotificationCache,
    ServerNotificationItem
} from '@/api/admin/noti/notiFetch';
import {
    NotificationItem,
    NotificationFilters,
    NotificationTab,
    NotificationContextType,
    NotificationProviderProps
} from '@/types/notification';
import {useNotificationSSE} from '@/hooks/useNotificationSSE';
import {useQuery} from '@tanstack/react-query';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const transformServerDataToClient = (serverItem: ServerNotificationItem): NotificationItem => {
    if (!serverItem.id || !serverItem.type || !serverItem.content) {
        throw new Error('필수 알림 데이터가 누락되었습니다.');
    }

    const categoryMap: Record<string, 'QnA' | 'Feedback'> = {
        QNA: 'QnA',
        FEEDBACK: 'Feedback',
        UPDATE: 'Feedback',
    };

    return {
        id: String(serverItem.id),
        category: categoryMap[serverItem.type] || 'Feedback',
        message: serverItem.content.description || '',
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
    const pathname = usePathname();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [filters, setFilters] = useState<NotificationFilters>({
        tab: '전체',
        category: '전체',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const latestReqRef = useRef(0);
    const isInitializedRef = useRef(false);
    const sseInitializedRef = useRef(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const {
        data: unreadCount = 0,
        refetch: refetchUnreadCount,
    } = useQuery({
        queryKey: ['unreadNotificationCount'],
        queryFn: async () => fetchUnreadNotificationCount(true).then(res => res.result.count),
        staleTime: 10000,
    });

    const handleNewNotification = useCallback((serverNotification: ServerNotificationItem) => {
        try {
            if (filters.tab === '전체' || filters.tab === '읽지 않음') {
                const newNotification = transformServerDataToClient(serverNotification);

                setNotifications(prev => {
                    const exists = prev.some(item => item.id === newNotification.id);
                    if (exists) {
                        return prev;
                    }

                    const updated = [newNotification, ...prev];
                    return updated;
                });
            }

            clearNotificationCache();
            showNotificationToast?.(serverNotification);
        } catch (error) {
        }
    }, [filters.tab, currentPage]);

    const handleConnectionOpen = useCallback(() => {
    }, []);

    const handleConnectionError = useCallback((error: Event) => {
    }, []);

    const handleConnectionClose = useCallback(() => {
    }, []);

    const {isConnected, connectionError, reconnect} = useNotificationSSE({
        onNewNotification: handleNewNotification,
        onError: handleConnectionError,
        onConnectionOpen: handleConnectionOpen,
        onConnectionClose: handleConnectionClose,
        autoReconnect: true,
        reconnectInterval: 5000
    });

    useEffect(() => {
        if (isConnected && !sseInitializedRef.current) {
            sseInitializedRef.current = true;
        }
    }, [isConnected]);

    const showNotificationToast = useCallback((notification: ServerNotificationItem) => {
        if (Notification.permission === 'granted') {
            new Notification(`${notification.content.department}에서 알림`, {
                body: notification.content.description,
                icon: '/favicon.ico',
                tag: `notification-${notification.id}`
            });
        }
    }, []);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
            });
        }
    }, []);

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

                if (latestReqRef.current !== reqId) return;

                if (response.success) {
                    const transformed = response.result.notificationResponseList.map(
                        transformServerDataToClient
                    );

                    setNotifications(transformed);

                    const derived = transformed.filter(i => !i.isRead).length;
                    refetchUnreadCount(); // 읽지 않은 알림 수를 서버에서 최신 상태로 가져옴
                    setHasNext(response.result.hasNext);

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
                setNotifications([]);
            } finally {
                setIsLoading(false);
            }
        },
        [filters.tab, itemsPerPage]
    );

    const filteredNotifications = notifications;

    const derivedUnreadFromList = filteredNotifications.filter(n => !n.isRead).length;

    const paginatedNotifications = filteredNotifications;

    const handleTabChange = useCallback((tab: NotificationTab) => {
        setFilters((prev) => ({...prev, tab}));
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback(
        (page: number) => {
            setCurrentPage(page);
            loadPageData(page);
        },
        [loadPageData]
    );

    const handleItemClick = useCallback(async (id: string) => {
        try {
            const clickedNotification = notifications.find(item => item.id === id);
            if (!clickedNotification) {
                return;
            }

            if (clickedNotification.isRead) {
                return;
            }

            const response = await markNotificationAsRead(Number(id));

            if (response.success) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === id
                            ? {...notification, isRead: true}
                            : notification
                    )
                );
                await refetchUnreadCount();

                if (filters.tab === '읽지 않음') {
                    setTimeout(() => {
                        loadPageData(currentPage);
                    }, 100);
                }
            }
        } catch (error) {
        }
    }, [notifications, filters.tab, currentPage, loadPageData, refetchUnreadCount]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            const response = await markAllNotificationsAsRead();
            if (response.success) {
                setNotifications((prev) =>
                    prev.map((n) => ({...n, isRead: true}))
                );
                await refetchUnreadCount();
                setTimeout(() => {
                    loadPageData(currentPage);
                }, 100);
            }
        } catch (error) {
        }
    }, [currentPage, loadPageData, refetchUnreadCount]);

    const initializeNotifications = useCallback(async () => {
        if (isInitializedRef.current || !isClient) {
            return;
        }

        isInitializedRef.current = true;

        await loadPageData(1);
        await refetchUnreadCount();
    }, [loadPageData, isClient, refetchUnreadCount]);

    useEffect(() => {
        if (isClient && !isInitializedRef.current) {
            setTimeout(() => {
                initializeNotifications();
            }, 100);
        }
    }, [isClient, initializeNotifications]);

    useEffect(() => {
        if (!isInitializedRef.current) return;

        setCurrentPage(1);
        setTotalPages(1);
        loadPageData(1);
    }, [filters.tab]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'accessToken' && event.newValue) {
                isInitializedRef.current = false;
                sseInitializedRef.current = false;
                setTimeout(() => {
                    if (isClient) {
                        initializeNotifications();
                    }
                }, 100);
            } else if (event.key === 'accessToken' && !event.newValue) {
                setNotifications([]);
                isInitializedRef.current = false;
                sseInitializedRef.current = false;
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isClient, initializeNotifications]);

    useEffect(() => {
        if (!isClient) return;

        const handleBeforeUnload = () => {
            localStorage.setItem('unreadNotificationCount', String(unreadCount));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [unreadCount, isClient]);

    const refreshModalData = useCallback(async () => {
        try {
            const isReadParam = false;
            const response = await fetchNotificationList(isReadParam, 0);
            if (response.success) {
                const transformed = response.result.notificationResponseList.map(
                    transformServerDataToClient
                );
                setNotifications(transformed);
            }
            await refetchUnreadCount();
        } catch (error) {}
    }, [refetchUnreadCount]);

    const contextValue: NotificationContextType = {
        notifications,
        filteredNotifications,
        paginatedNotifications,
        filters,
        currentPage,
        totalPages,
        unreadCount: unreadCount as number,
        handleTabChange,
        handlePageChange,
        handleItemClick,
        handleMarkAllAsRead,
        refreshModalData,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
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
