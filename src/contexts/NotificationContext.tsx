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
import { useNotificationSSE } from '@/hooks/useNotificationSSE';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 서버 데이터를 클라이언트 타입으로 변환하는 함수
const transformServerDataToClient = (serverItem: ServerNotificationItem): NotificationItem => {
    // 필수 데이터 검증
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
    // Hydration 문제를 방지하기 위해 초기값을 0으로 설정
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [filters, setFilters] = useState<NotificationFilters>({
        tab: '전체',
        category: '전체',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0); // 초기값을 0으로 고정
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isClient, setIsClient] = useState(false); // 클라이언트 마운트 확인용

    const latestReqRef = useRef(0);
    const isInitializedRef = useRef(false);
    const sseInitializedRef = useRef(false);

    // 클라이언트 사이드에서만 실행되도록 하는 useEffect
    useEffect(() => {
        setIsClient(true);
        // 클라이언트 마운트 후 localStorage에서 값 복원
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('unreadNotificationCount');
            if (saved) {
                const parsedCount = parseInt(saved, 10);
                console.log('💾 클라이언트 마운트 후 localStorage에서 unreadCount 복원:', parsedCount);
                setUnreadCount(parsedCount);
            }
        }
    }, []);

    // 읽지 않은 개수가 변경될 때마다 localStorage에 저장 (클라이언트에서만)
    useEffect(() => {
        if (isClient && typeof window !== 'undefined') {
            localStorage.setItem('unreadNotificationCount', String(unreadCount));
            console.log('💾 localStorage에 unreadCount 저장:', unreadCount);
        }
    }, [unreadCount, isClient]);

    // 새 알림 수신 핸들러 (실제 notification 이벤트만 처리)
    const handleNewNotification = useCallback((serverNotification: ServerNotificationItem) => {
        try {
            // 실제 알림 데이터가 수신될 때만 읽지 않은 개수 증가
            setUnreadCount(prev => {
                const newCount = prev + 1;
                console.log('🔔 새 알림으��� 인한 개수 증가:', prev, '->', newCount);
                return newCount;
            });

            // 현재 탭이 알림을 표시할 수 있는 상태이고 첫 페이지인 경우에만 목록에 추가
            if ((filters.tab === '전체' || filters.tab === '읽지 않음') && currentPage === 1) {
                const newNotification = transformServerDataToClient(serverNotification);

                setNotifications(prev => {
                    const exists = prev.some(item => item.id === newNotification.id);
                    if (exists) {
                        return prev;
                    }

                    const updated = [newNotification, ...prev];
                    return updated; // 안읽은 개수만큼 표시하므로 slice 제���
                });
            }

            clearNotificationCache();
            showNotificationToast?.(serverNotification);
        } catch (error) {
            console.error('새 알림 처리 실패:', error);
        }
    }, [filters.tab, currentPage]);

    // SSE 연결 상태 변경 핸들러 (연결 상태만 처리, 알림 개수는 변경하지 않음)
    const handleConnectionOpen = useCallback(() => {
    }, []);

    const handleConnectionError = useCallback((error: Event) => {
    }, []);

    const handleConnectionClose = useCallback(() => {
    }, []);

    // SSE 연결 설정 - 한 번만 초기화
    const { isConnected, connectionError, reconnect } = useNotificationSSE({
        onNewNotification: handleNewNotification,
        onError: handleConnectionError,
        onConnectionOpen: handleConnectionOpen,
        onConnectionClose: handleConnectionClose,
        autoReconnect: true,
        reconnectInterval: 5000
    });

    // SSE 초기화 상태 업데이트
    useEffect(() => {
        if (isConnected && !sseInitializedRef.current) {
            console.log('✅ SSE 초기화 완료');
            sseInitializedRef.current = true;
        }
    }, [isConnected]);

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
            });
        }
    }, []);

    // 페이지 데이터 로드 (안읽은 개수만큼 데이터 가져오기)
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

                    console.log('📊 서버에서 받은 데이터:', {
                        total: transformed.length,
                        unreadItems: transformed.filter(item => !item.isRead).length,
                        readItems: transformed.filter(item => item.isRead).length,
                        rawData: transformed.map(item => ({ id: item.id, isRead: item.isRead }))
                    });

                    setNotifications(transformed);
                    setHasNext(response.result.hasNext);

                    // 페이지 수 계산
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
                console.error('❌ 데이터 로드 실패:', error);
                setNotifications([]);
            } finally {
                setIsLoading(false);
            }
        },
        [filters.tab, itemsPerPage]
    );

    // 읽지 않은 알림 개수 로드 (서버에서 실제 개수 가져오기)
    const loadUnreadCount = useCallback(async (forceReload = false) => {
        try {
            // 캐시 무효화가 필요한 경우
            if (forceReload) {
                clearNotificationCache();
            }

            console.log('📊 서버에서 읽지 않은 알림 개수 조회 시작');
            const response = await fetchUnreadNotificationCount(forceReload);
            if (response.success) {
                console.log('📊 서버에서 읽지 않은 알림 개수 로드:', response.data.count);
                setUnreadCount(response.data.count);
                return response.data.count;
            }
        } catch (error) {
            console.error('❌ 읽지 않은 알림 개수 로드 실패:', error);
            // 실패 시 localStorage 값 다시 확인 (클라이언트에서만)
            if (isClient && typeof window !== 'undefined') {
                const savedCount = localStorage.getItem('unreadNotificationCount');
                if (savedCount) {
                    const parsedCount = parseInt(savedCount, 10);
                    console.log('💾 실패 시 localStorage에서 값 복원:', parsedCount);
                    setUnreadCount(parsedCount);
                    return parsedCount;
                }
            }
        }
        return unreadCount;
    }, [unreadCount, isClient]);

    // 필터링된 알림 목록 (카테고리 필터링 제거)
    const filteredNotifications = notifications;

    console.log('🔍 필터링 결과:', {
        tab: filters.tab,
        totalNotifications: notifications.length,
        filteredCount: filteredNotifications.length,
        unreadInFiltered: filteredNotifications.filter(item => !item.isRead).length,
        readInFiltered: filteredNotifications.filter(item => item.isRead).length
    });

    // 페이지네이션된 알림 목록 - 서버에서 이미 필터링된 데이터 사용
    const paginatedNotifications = filteredNotifications;

    // 핸들러
    const handleTabChange = useCallback((tab: NotificationTab) => {
        setFilters((prev) => ({ ...prev, tab }));
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
            // 클릭한 알림 찾기
            const clickedNotification = notifications.find(item => item.id === id);
            if (!clickedNotification) {
                console.warn('클릭한 알림을 찾을 수 없습니다:', id);
                return;
            }

            // 이미 읽은 알림이면 읽음 처리 스킵
            if (clickedNotification.isRead) {
                console.log('이미 읽은 알림입니다:', id);
                return;
            }

            console.log('📖 알림 읽음 처리 시��:', id);

            // 서버에 읽음 처리 요청
            const response = await markNotificationAsRead(Number(id));

            if (response.success) {
                console.log('✅ 알림 읽음 처리 성공:', id);

                // 로컬 상태 업데이트 - 해당 알림을 읽음으로 변경
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === id
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );

                // 읽지 않은 개수 감소
                setUnreadCount(prev => {
                    const newCount = Math.max(0, prev - 1);
                    console.log('📊 읽지 않은 개수 감소:', prev, '->', newCount);
                    return newCount;
                });

                // 필요한 경우 데이터 새로고침 (읽지 않음 탭에서 읽음 처리 시)
                if (filters.tab === '읽지 않음') {
                    // 읽지 않음 탭에서는 읽은 알림이 목록에서 사라져야 하므로 데이터 새로고침
                    setTimeout(() => {
                        loadPageData(currentPage);
                    }, 100);
                }
            }
        } catch (error) {
            console.error('❌ 알림 읽음 처리 실패:', error);
        }
    }, [notifications, filters.tab, currentPage, loadPageData]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            console.log('모든 알림 읽음 처리 시작');
            const response = await markAllNotificationsAsRead();
            if (response.success) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                );
                console.log('✅ 모든 알림 읽음 처리 - 개수 0으로 설정');
                setUnreadCount(0);

                loadPageData(currentPage);
            }
        } catch (error) {
            console.error('❌ 모든 알림 읽음 처리 실패:', error);
        }
    }, [currentPage, loadPageData]);

    // 초기화 함수 - 클라이언트 마운트 후에��� 실행
    const initializeNotifications = useCallback(async () => {
        if (isInitializedRef.current || !isClient) return;

        console.log('🚀 알림 데이터 초기화 시작');
        isInitializedRef.current = true;

        // 1. 읽지 않은 개수 먼저 로드 (서버에서 실제 값)
        await loadUnreadCount(true);

        // 2. 첫 페이지 데이터 로드
        await loadPageData(1);

        console.log('✅ 알림 데이터 초기화 완료');
    }, [loadUnreadCount, loadPageData, isClient]);

    // 클라이언트 마운트 후 초기화
    useEffect(() => {
        if (isClient && !isInitializedRef.current) {
            initializeNotifications();
        }
    }, [isClient, initializeNotifications]);

    // 탭 변경 시에만 페이지 데이터 ���로딩 (개수는 유지)
    useEffect(() => {
        if (!isInitializedRef.current) return;

        console.log('🔄 탭 변경으로 인한 데이터 재로드:', filters.tab);
        setCurrentPage(1);
        setTotalPages(1);
        loadPageData(1);
    }, [filters.tab, loadPageData]);

    // 로그인 상태 변경 감지를 위한 이벤트 리스너
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // 새로운 토큰이 저장되면 (로그인 시) 초기화
            if (event.key === 'accessToken' && event.newValue) {
                console.log('🔑 새 토큰 감지 - 알림 데이터 재초기화');
                isInitializedRef.current = false;
                sseInitializedRef.current = false;
                initializeNotifications();
            }
            // 토큰이 제거되면 (로그아웃 시) SSE만 리셋, 읽지 않은 개수는 유지
            else if (event.key === 'accessToken' && !event.newValue) {
                console.log('🚪 로그아웃 감지 - SSE 상태만 리셋 (읽지 않은 개수 유지)');
                setNotifications([]); // 알림 목록만 초기화
                isInitializedRef.current = false;
                sseInitializedRef.current = false;
                // unreadCount는 유지됨 (localStorage에서 관리)
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [initializeNotifications]);

    // 페이지 새로고침 시에도 localStorage에서 읽지 않은 개수 복원 (클라이언트에서만)
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

    // 모달용 데이터 새로고침 함수 (캐시 무효화 + 최신 데이터 조회)
    const refreshModalData = useCallback(async () => {
        try {
            console.log('🔄 모달용 데이터 새로고침 시작');

            // 1. 캐시 무효화
            clearNotificationCache();

            // 2. 읽지 않은 개수 강제 새로고침
            await loadUnreadCount(true);

            // 3. 현재 탭의 첫 페이지 데이터 새로고침 (읽지 않음 탭으로 강제 설정)
            const originalTab = filters.tab;

            // 읽지 않음 데이터를 가져오기 위해 임시로 탭 변경
            setFilters(prev => ({ ...prev, tab: '읽지 않음' }));
            await loadPageData(1);

            // 원래 탭으로 복원
            if (originalTab !== '읽지 않음') {
                setFilters(prev => ({ ...prev, tab: originalTab }));
            }

            console.log('✅ 모달용 데이터 새로고침 완료');
        } catch (error) {
            console.error('❌ 모달용 데이터 새로고침 실패:', error);
        }
    }, [loadUnreadCount, loadPageData, filters.tab]);

    // Context 값에 모달용 함수 추가
    const contextValue: NotificationContextType = {
        notifications,
        filteredNotifications,
        paginatedNotifications,
        filters,
        currentPage,
        totalPages,
        unreadCount,
        handleTabChange,
        handlePageChange,
        handleItemClick,
        handleMarkAllAsRead,
        refreshModalData, // 모달용 새로고침 함수 추가
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
