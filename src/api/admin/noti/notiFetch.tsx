import {authorizedFetch} from '@/api/auth/authorizedFetch';
import {EventSourcePolyfill} from 'event-source-polyfill';

const NOTI_API_BASE_URL = process.env.NEXT_PUBLIC_NOTI_API_BASE_URL;

// 캐시 설정
const CACHE_DURATION = 5 * 60 * 1000;
const UNREAD_COUNT_CACHE_DURATION = 30 * 1000;

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

    delete(key: string): void {
        this.cache.delete(key);
    }
}

const notificationCache = new NotificationCache();

const inFlight = new Map<string, Promise<any>>();

let unreadCountCallInProgress = false;
const unreadCountCallQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
}> = [];

async function getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = notificationCache.get<T>(key);
    if (cached) {
        return cached;
    }

    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) {
        return pending;
    }

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

export const fetchNotificationList = async (
    isRead?: boolean,
    offset: number = 0,
    limit?: number
): Promise<NotificationListResponse> => {
    const cacheKey = notificationCache.generateListKey(isRead, offset);
    return getOrFetch(cacheKey, async () => {
        const params = new URLSearchParams({offset: String(offset)});
        if (isRead !== undefined) {
            params.append('isRead', String(isRead));
        }
        if (limit !== undefined) params.append('limit', String(limit));

        const response = await authorizedFetch(
            `${NOTI_API_BASE_URL}/api/notifications?${params}`,
            {method: 'GET'}
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = (await response.json()) as NotificationListResponse;

        return data;
    });
};

// 안 읽은 알림 개수 조회용 함수입니다.
export const fetchUnreadNotificationCount = async (forceRefresh = false): Promise<NotificationCountResponse> => {
    const cacheKey = notificationCache.generateCountKey();

    if (forceRefresh) {
        notificationCache.delete(cacheKey);
        inFlight.delete(cacheKey);
    }

    const cached = notificationCache.get<NotificationCountResponse>(cacheKey);
    if (cached && !forceRefresh) {
        return cached;
    }

    if (unreadCountCallInProgress) {
        return new Promise((resolve, reject) => {
            unreadCountCallQueue.push({resolve, reject});
        });
    }

    unreadCountCallInProgress = true;

    try {
        const response = await authorizedFetch(
            `${NOTI_API_BASE_URL}/api/notifications/unread-count`,
            {method: 'GET'}
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = (await response.json()) as NotificationCountResponse;

        notificationCache.set(cacheKey, data);

        if (typeof window !== 'undefined' && data.success && data.data?.count !== undefined) {
            const serverCount = data.data.count;
            const currentLocalCount = localStorage.getItem('unreadNotificationCount');

            localStorage.setItem('unreadNotificationCount', String(serverCount));
        }

        unreadCountCallQueue.forEach(({resolve}) => resolve(data));
        unreadCountCallQueue.length = 0;

        return data;
    } catch (error) {

        unreadCountCallQueue.forEach(({reject}) => reject(error));
        unreadCountCallQueue.length = 0;

        throw error;
    } finally {
        unreadCountCallInProgress = false;
    }
};

// 모든 알림 읽음을 처리하는 함수입니다.
export const markAllNotificationsAsRead = async (): Promise<NotificationCountResponse> => {
    const response = await authorizedFetch(
        `${NOTI_API_BASE_URL}/api/notifications/read-all`,
        {method: 'PATCH'}
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as NotificationCountResponse;

    if (data.success) {
        inFlight.clear();
        notificationCache.clear();

        if (typeof window !== 'undefined') {
            localStorage.setItem('unreadNotificationCount', '0');
        }
    }
    return data;
};

// 단일 알림 읽음 처리하는 함수입니다.
export const markNotificationAsRead = async (
    notificationId: number
): Promise<NotificationIdResponse> => {

    const response = await authorizedFetch(
        `${NOTI_API_BASE_URL}/api/notifications/${notificationId}/read`,
        {method: 'PATCH'}
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as NotificationIdResponse;

    if (data.success) {
        inFlight.clear();
        notificationCache.invalidatePattern(/^(notifications|unread-count)/);

        if (typeof window !== 'undefined') {
            const currentCount = parseInt(localStorage.getItem('unreadNotificationCount') || '0', 10);
            const newCount = Math.max(0, currentCount - 1);
            localStorage.setItem('unreadNotificationCount', String(newCount));
        }
    } else {
    }

    return data;
};

// SSE 구독을 위한 fetch 기반 함수입니다. 테스트용 함수로써, 현재는 미사용합니다.
export const createNotificationSSEWithAuth = async (lastEventId?: number): Promise<Response> => {
    const {getValidAccessToken} = await import('@/utils/tokenStorage');
    const token = await getValidAccessToken();
    if (!token) throw new Error('인증 토큰이 없습니다.');

    const params = new URLSearchParams({token});
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

// SSE 구독을 위한 EventSourcePolyfill 기반 함수입니다.
export const createNotificationSSEWithHeaders = async (lastEventId?: number): Promise<EventSourcePolyfill> => {
    const {getValidAccessToken} = await import('@/utils/tokenStorage');
    const token = await getValidAccessToken();
    if (!token) throw new Error('인증 토큰이 없습니다.');

    const params = new URLSearchParams({token});
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

// 기존 EventSource 기반 함수를 EventSourcePolyfill로 변경한 함수입니다.
export const clearNotificationCache = () => {
    inFlight.clear();
    notificationCache.clear();
};

export const invalidateUnreadCountCache = () => {
    const countKey = notificationCache.generateCountKey();
    notificationCache.delete(countKey);
    inFlight.delete(countKey);
};
