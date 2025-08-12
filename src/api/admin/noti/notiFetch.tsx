import { authorizedFetch } from '@/api/auth/authorizedFetch';
import { EventSourcePolyfill } from 'event-source-polyfill';

const NOTI_API_BASE_URL = process.env.NEXT_PUBLIC_NOTI_API_BASE_URL;

// 캐시 설정
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const UNREAD_COUNT_CACHE_DURATION = 30 * 1000; // 30초 (읽지 않은 개수는 짧게)

interface CacheItem<T> {
    data: T;
    timestamp: number;
    key: string;
}

class NotificationCache {
    private cache = new Map<string, CacheItem<any>>();

    private generateKey(params: Record<string, any>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .map((key) => `${key}=${params[key]}`)
            .join('&');
        return sortedParams;
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > CACHE_DURATION;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            key,
        });
    }

    clear(): void {
        this.cache.clear();
    }

    // 특정 패턴의 캐시 삭제 (읽음 처리 후 관련 캐시 무효화)
    invalidatePattern(pattern: RegExp): void {
        for (const [key] of this.cache) {
            if (pattern.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    generateListKey(isRead?: boolean, offset?: number): string {
        return this.generateKey({
            endpoint: 'notifications',
            isRead: isRead ?? 'undefined',
            offset: offset ?? 0,
        });
    }

    generateCountKey(): string {
        return this.generateKey({
            endpoint: 'unread-count',
        });
    }

    // 특정 키의 캐시 강제 삭제
    delete(key: string): void {
        this.cache.delete(key);
    }
}

const notificationCache = new NotificationCache();

// 동시 호출 합치기용: 같은 키의 진행 중 요청을 공유
const inFlight = new Map<string, Promise<any>>();

async function getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // 1) 캐시 히트면 즉시 반환
    const cached = notificationCache.get<T>(key);
    if (cached) {
        return cached;
    }

    // 2) 진행 중 요청이 있으면 그 Promise 재사용
    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) {
        return pending;
    }

    // 3) 실제 네트워크 요청 수행
    const p = fetcher()
        .then((data) => {
            notificationCache.set(key, data);
            inFlight.delete(key);
            return data;
        })
        .catch((err) => {
            inFlight.delete(key);
            throw err;
        });

    inFlight.set(key, p);
    return p;
}

// 서버 응답 구조에 맞춘 타입 정의
export interface NotificationContent {
    department: string;
    description: string;
}

export interface ServerNotificationItem {
    id: number;
    createdAt: string;
    senderId: number;
    receiverId: number | null;
    type: 'UPDATE' | 'FEEDBACK' | 'QNA';
    isRead: boolean;
    content: NotificationContent;
}

export interface NotificationListResponse {
    success: boolean;
    code: number;
    timestamp: string;
    message: string;
    result: {
        notificationResponseList: ServerNotificationItem[];
        nextOffset: number;
        hasNext: boolean;
    };
}

export interface NotificationCountResponse {
    success: boolean;
    data: {
        count: number;
    };
    message?: string;
}

export interface NotificationIdResponse {
    success: boolean;
    data: {
        notificationId: number;
    };
    message?: string;
}

// 알림 목록 조회 - 안읽은 개수만큼 가져오도록 수정
export const fetchNotificationList = async (
    isRead?: boolean,
    offset: number = 0,
    limit?: number // limit 파라미터 추가
): Promise<NotificationListResponse> => {
    const cacheKey = notificationCache.generateListKey(isRead, offset);
    return getOrFetch(cacheKey, async () => {
        const params = new URLSearchParams({ offset: String(offset) });
        if (isRead !== undefined) {
            params.append('isRead', String(isRead));
            console.log('📨 API 요청 파라미터:', { isRead, offset });
        }
        if (limit !== undefined) params.append('limit', String(limit));

        const response = await authorizedFetch(
            `${NOTI_API_BASE_URL}/api/notifications?${params}`,
            { method: 'GET' }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = (await response.json()) as NotificationListResponse;

        console.log('📨 API 응답 데이터:', {
            success: data.success,
            totalItems: data.result?.notificationResponseList?.length || 0,
            hasNext: data.result?.hasNext,
            sampleData: data.result?.notificationResponseList?.slice(0, 2).map(item => ({
                id: item.id,
                isRead: item.isRead,
                type: item.type
            })) || []
        });

        return data;
    });
};

// 안 읽은 알림 개수 조회 - 캐싱 + 동시 호출 합치기 + 강제 새로고침 옵션
export const fetchUnreadNotificationCount = async (forceRefresh = false): Promise<NotificationCountResponse> => {
    const cacheKey = notificationCache.generateCountKey();

    // 강제 새로고침이 요청되면 캐시 삭제
    if (forceRefresh) {
        notificationCache.delete(cacheKey);
        // 진행 중인 요청도 제거
        inFlight.delete(cacheKey);
    }

    return getOrFetch(cacheKey, async () => {
        console.log('🌐 서버에서 읽지 않은 알림 개수 API 호출');
        const response = await authorizedFetch(
            `${NOTI_API_BASE_URL}/api/notifications/unread-count`,
            { method: 'GET' }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = (await response.json()) as NotificationCountResponse;
        console.log('📊 서버 응답 읽지 않은 개수:', data.data?.count || 0);

        // 성공적으로 서버에서 데이터를 받아왔��� 때 localStorage에도 저장
        if (typeof window !== 'undefined' && data.success) {
            localStorage.setItem('unreadNotificationCount', String(data.data?.count || 0));
            console.log('💾 읽지 않은 개수 localStorage 저장:', data.data?.count || 0);
        }

        return data;
    });
};

// 모든 알림 읽음 처리 - 캐시 무효화
export const markAllNotificationsAsRead = async (): Promise<NotificationCountResponse> => {
    const response = await authorizedFetch(
        `${NOTI_API_BASE_URL}/api/notifications/read-all`,
        { method: 'PATCH' }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as NotificationCountResponse;

    if (data.success) {
        // 진행 중 요청/캐시 모두 정리
        inFlight.clear();
        notificationCache.clear();

        // localStorage에서도 읽지 않은 개수 0으로 설정
        if (typeof window !== 'undefined') {
            localStorage.setItem('unreadNotificationCount', '0');
            console.log('💾 모든 읽음 처리 - localStorage 개수 0으로 설정');
        }
    }
    return data;
};

// 단일 알림 읽음 처리 - 선택적 캐시 무효화
export const markNotificationAsRead = async (
    notificationId: number
): Promise<NotificationIdResponse> => {
    console.log('🌐 단일 알림 읽음 처리 API 호출:', notificationId);

    const response = await authorizedFetch(
        `${NOTI_API_BASE_URL}/api/notifications/${notificationId}/read`,
        { method: 'PATCH' }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as NotificationIdResponse;

    if (data.success) {
        console.log('✅ 단일 알림 읽음 처리 API 성공:', notificationId);

        // 진행 중 동일 키 요청이 있으면 취소는 못하지만, 이후 조회는 새 데이터로
        inFlight.clear();
        notificationCache.invalidatePattern(/^(notifications|unread-count)/);

        // localStorage의 읽지 않은 개수 1 감소
        if (typeof window !== 'undefined') {
            const currentCount = parseInt(localStorage.getItem('unreadNotificationCount') || '0', 10);
            const newCount = Math.max(0, currentCount - 1);
            localStorage.setItem('unreadNotificationCount', String(newCount));
            console.log('💾 단일 읽음 처리 - localStorage 개수 감소:', currentCount, '->', newCount);
        }
    } else {
        console.error('❌ 단일 알림 읽음 처리 API 실패:', data);
    }

    return data;
};

// SSE 구독�� 위한 fetch 기반 함수 (인증 헤더 포함)
export const createNotificationSSEWithAuth = async (lastEventId?: number): Promise<Response> => {
    const { getValidAccessToken } = await import('@/utils/tokenStorage');
    const token = await getValidAccessToken();
    if (!token) throw new Error('인증 토큰이 없습니다.');

    const params = new URLSearchParams({ token });
    if (lastEventId) params.append('lastEventId', String(lastEventId));

    const response = await fetch(
        `${NOTI_API_BASE_URL}/api/notifications/subscribe?${params}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/event-stream'
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
};

// SSE 구독을 위한 EventSourcePolyfill 기반 함수 (인증 헤더 포함)
export const createNotificationSSEWithHeaders = async (lastEventId?: number): Promise<EventSourcePolyfill> => {
    const { getValidAccessToken } = await import('@/utils/tokenStorage');
    const token = await getValidAccessToken();
    if (!token) throw new Error('인증 토큰이 없습니다.');

    const params = new URLSearchParams({ token });
    if (lastEventId) params.append('lastEventId', String(lastEventId));

    const eventSource = new EventSourcePolyfill(
        `${NOTI_API_BASE_URL}/api/notifications/subscribe?${params}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache'
            },
            heartbeatTimeout: 120000, // 2분
            retryInterval: 1000 // 1초 후 재시도
        }
    );

    return eventSource;
};

// 기존 EventSource 기반 함수를 EventSourcePolyfill로 변경
export const createNotificationSSE = async (lastEventId?: number): Promise<EventSourcePolyfill> => {
    const { getValidAccessToken } = await import('@/utils/tokenStorage');
    const token = await getValidAccessToken();
    if (!token) throw new Error('인증 토큰이 없습니다.');

    const params = new URLSearchParams({ token });
    if (lastEventId) params.append('lastEventId', String(lastEventId));

    const eventSource = new EventSourcePolyfill(
        `${NOTI_API_BASE_URL}/api/notifications/subscribe?${params}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache'
            },
            heartbeatTimeout: 120000,
            retryInterval: 1000
        }
    );

    return eventSource;
};

// 캐시 관리 유틸리티 함수들 export
export const clearNotificationCache = () => {
    inFlight.clear();
    notificationCache.clear();
};

export const invalidateUnreadCountCache = () => {
    const countKey = notificationCache.generateCountKey();
    notificationCache.delete(countKey);
    inFlight.delete(countKey);
};
