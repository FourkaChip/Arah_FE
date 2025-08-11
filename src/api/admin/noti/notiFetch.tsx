import { authorizedFetch } from '@/api/auth/authorizedFetch';

const NOTI_API_BASE_URL = process.env.NEXT_PUBLIC_NOTI_API_BASE_URL;

// 캐시 설정
const CACHE_DURATION = 5 * 60 * 1000; // 5분

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
}

const notificationCache = new NotificationCache();

/** 동시 호출 합치기용: 같은 키의 진행 중 요청을 공유 */
const inFlight = new Map<string, Promise<any>>();

async function getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // 1) 캐시 히트면 즉시 반환
    const cached = notificationCache.get<T>(key);
    if (cached) {
        // console.log('캐시 히트:', key);
        return cached;
    }

    // 2) 진행 중 요청이 있으면 그 Promise 재사용
    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) {
        // console.log('진행 중 요청 재사용:', key);
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

// 알림 목록 조회 - 캐싱 + 동시 호출 합치기
export const fetchNotificationList = async (
    isRead?: boolean,
    offset: number = 0
): Promise<NotificationListResponse> => {
    const cacheKey = notificationCache.generateListKey(isRead, offset);
    return getOrFetch(cacheKey, async () => {
        const params = new URLSearchParams({ offset: String(offset) });
        if (isRead !== undefined) params.append('isRead', String(isRead));

        const response = await authorizedFetch(
            `${NOTI_API_BASE_URL}/api/notifications?${params}`,
            { method: 'GET' }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = (await response.json()) as NotificationListResponse;
        return data;
    });
};

// 안 읽은 알림 개수 조회 - 캐싱 + 동시 호출 합치기
export const fetchUnreadNotificationCount = async (): Promise<NotificationCountResponse> => {
    const cacheKey = notificationCache.generateCountKey();
    return getOrFetch(cacheKey, async () => {
        const response = await authorizedFetch(
            `${NOTI_API_BASE_URL}/api/notifications/unread-count`,
            { method: 'GET' }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = (await response.json()) as NotificationCountResponse;
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
    }
    return data;
};

// 단일 알림 읽음 처리 - 선택적 캐시 무효화
export const markNotificationAsRead = async (
    notificationId: number
): Promise<NotificationIdResponse> => {
    const response = await authorizedFetch(
        `${NOTI_API_BASE_URL}/api/notifications/${notificationId}/read`,
        { method: 'PATCH' }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as NotificationIdResponse;

    if (data.success) {
        // 진행 중 동일 키 요청이 있으면 취소는 못하지만, 이후 조회는 새 데이터로
        inFlight.clear();
        notificationCache.invalidatePattern(/^(notifications|unread-count)/);
    }
    return data;
};

// SSE 구독을 위한 EventSource 생성 함수 (토큰은 별도로 처리 필요)
export const createNotificationSSE = async (lastEventId?: number): Promise<EventSource> => {
    const { getValidAccessToken } = await import('@/utils/tokenStorage');
    const token = await getValidAccessToken();
    if (!token) throw new Error('인증 토큰이 없습니다.');

    const params = new URLSearchParams({ token });
    if (lastEventId) params.append('lastEventId', String(lastEventId));

    const eventSource = new EventSource(
        `${NOTI_API_BASE_URL}/api/notifications/subscribe?${params}`
    );
    return eventSource;
};

// 캐시 관리 유틸리티 함수들 export
export const clearNotificationCache = () => {
    inFlight.clear();
    notificationCache.clear();
};

export const invalidateNotificationListCache = () => {
    inFlight.clear();
    notificationCache.invalidatePattern(/^notifications/);
};

export const invalidateUnreadCountCache = () => {
    inFlight.clear();
    notificationCache.invalidatePattern(/^unread-count/);
};