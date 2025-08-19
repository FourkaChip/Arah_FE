'use client';

import {useEffect, useRef, useCallback, useState} from 'react';
import {ServerNotificationItem} from '@/api/admin/noti/notiFetch';
import {getValidAccessToken} from '@/utils/tokenStorage';
import {EventSourcePolyfill} from 'event-source-polyfill';

interface SSENotificationData {
    id: number;
    senderId: number;
    receiverId: number;
    type: 'UPDATE' | 'FEEDBACK' | 'QNA';
    companyId: number | null;
    content: {
        department: string;
        description: string;
    };
}

interface UseNotificationSSEProps {
    onNewNotification?: (notification: ServerNotificationItem) => void;
    onError?: (error: Event) => void;
    onConnectionOpen?: () => void;
    onConnectionClose?: () => void;
    autoReconnect?: boolean;
    reconnectInterval?: number;
}

let globalSSEInstance: EventSourcePolyfill | null = null;
let globalConnectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 1;

export const useNotificationSSE = ({
                                       onNewNotification,
                                       onError,
                                       onConnectionOpen,
                                       onConnectionClose,
                                       autoReconnect = true,
                                       reconnectInterval = 5000,
                                   }: UseNotificationSSEProps = {}) => {
    const esRef = useRef<EventSourcePolyfill | null>(null);
    const connectingRef = useRef(false);
    const lastEventIdRef = useRef<number | undefined>(undefined);
    const mountedRef = useRef(true);
    const hasConnectedRef = useRef(false);

    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const cleanup = useCallback(() => {
        try {
            if (esRef.current && esRef.current === globalSSEInstance) {
                esRef.current.close();
                globalSSEInstance = null;
            }
        } catch {
        }
        esRef.current = null;
        connectingRef.current = false;
        globalConnectionAttempts = 0;
        if (mountedRef.current) {
            setIsConnected(false);
        }
    }, []);

    const connect = useCallback(async () => {
        if (connectingRef.current || globalConnectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
            return;
        }

        if (globalSSEInstance && globalSSEInstance.readyState === EventSourcePolyfill.OPEN) {
            esRef.current = globalSSEInstance;
            setIsConnected(true);
            setConnectionError(null);
            onConnectionOpen?.();
            return;
        }

        if (!mountedRef.current) {
            return;
        }

        connectingRef.current = true;
        globalConnectionAttempts += 1;
        setConnectionError(null);


        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error('인증 토큰이 없습니다.');

            const NOTI_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            if (!NOTI_API_BASE_URL) throw new Error('NOTI API URL이 설정되지 않았습니다.');

            const params = new URLSearchParams({token});
            if (lastEventIdRef.current) {
                params.append('lastEventId', String(lastEventIdRef.current));
            }

            const headers: Record<string, string> = {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/event-stream',
                'Authorization': `Bearer ${token}`,
                'Accept-Encoding': 'identity'
            };

            const es = new EventSourcePolyfill(
                `${NOTI_API_BASE_URL}/api/notifications/subscribe?${params}`,
                {
                    headers,
                    withCredentials: false,
                    heartbeatTimeout: 45_000,
                }
            );

            esRef.current = es;
            globalSSEInstance = es;

            es.onopen = (event: Event) => {
                connectingRef.current = false;
                hasConnectedRef.current = true;
                if (mountedRef.current) {
                    setIsConnected(true);
                    setConnectionError(null);
                    onConnectionOpen?.();
                }
            };

            es.addEventListener('notification', (event: any) => {
                if (!mountedRef.current) return;

                if (event.lastEventId) {
                    const parsed = Number(event.lastEventId);
                    if (!Number.isNaN(parsed)) lastEventIdRef.current = parsed;
                }

                try {
                    const data: SSENotificationData = JSON.parse(event.data);
                    const serverNotification: ServerNotificationItem = {
                        id: data.id,
                        createdAt: new Date().toISOString(),
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        type: data.type,
                        isRead: false,
                        content: data.content,
                        companyId: data.companyId,
                    };
                    onNewNotification?.(serverNotification);
                } catch (err) {
                }
            });

            es.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.success === false && data.code && data.message) {
                        if (mountedRef.current) {
                            setConnectionError(`서버 에러: ${data.message}`);
                        }
                        es.close();
                        return;
                    }
                } catch (err) {
                }
            };

            es.onerror = (event: Event) => {
                connectingRef.current = false;
                if (mountedRef.current) {
                    setIsConnected(false);
                    setConnectionError('연결 오류');
                    onError?.(event);
                }

                if (!autoReconnect) {
                    es.close();
                    globalSSEInstance = null;
                    globalConnectionAttempts = 0;
                }
            };

        } catch (error) {
            connectingRef.current = false;
            globalConnectionAttempts = 0;
            if (mountedRef.current) {
                setIsConnected(false);
                setConnectionError(error instanceof Error ? error.message : '연결 실패');
                onError?.(error as unknown as Event);
            }
        }
    }, [onNewNotification, onError, onConnectionOpen, autoReconnect]);

    const disconnect = useCallback(() => {
        cleanup();
        onConnectionClose?.();
    }, [cleanup, onConnectionClose]);

    const reconnect = useCallback(() => {
        cleanup();
        globalConnectionAttempts = 0;
        connect();
    }, [cleanup, connect]);

    useEffect(() => {
        mountedRef.current = true;

        if (!hasConnectedRef.current && globalConnectionAttempts === 0) {
            connect();
        } else if (globalSSEInstance && globalSSEInstance.readyState === EventSourcePolyfill.OPEN) {
            esRef.current = globalSSEInstance;
            setIsConnected(true);
        }

        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && !isConnected && !connectingRef.current && mountedRef.current) {
                setTimeout(() => {
                    if (globalConnectionAttempts === 0) {
                        connect();
                    }
                }, 1000);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isConnected, connect]);

    return {
        isConnected,
        connectionError,
        connect,
        disconnect,
        reconnect,
    };
};
