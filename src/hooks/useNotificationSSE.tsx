'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { ServerNotificationItem } from '@/api/admin/noti/notiFetch';
import { getValidAccessToken } from '@/utils/tokenStorage';

interface SSENotificationData {
    id: number;
    senderId: number;
    receiverId: number;
    type: 'UPDATE' | 'FEEDBACK' | 'QNA';
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

export const useNotificationSSE = ({
    onNewNotification,
    onError,
    onConnectionOpen,
    onConnectionClose,
    autoReconnect = true,
    reconnectInterval = 5000
}: UseNotificationSSEProps = {}) => {
    const abortControllerRef = useRef<AbortController | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastEventIdRef = useRef<number | undefined>(undefined);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const cleanup = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const connect = useCallback(async () => {
        try {
            cleanup();
            setConnectionError(null);

            const token = await getValidAccessToken();
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const NOTI_API_BASE_URL = process.env.NEXT_PUBLIC_NOTI_API_BASE_URL;
            const params = new URLSearchParams({ token });
            if (lastEventIdRef.current) {
                params.append('lastEventId', lastEventIdRef.current.toString());
            }

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            const response = await fetch(
                `${NOTI_API_BASE_URL}/api/notifications/subscribe?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/event-stream'
                    },
                    signal: abortController.signal
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            console.log('SSE 연결 성공');
            setIsConnected(true);
            setConnectionError(null);
            onConnectionOpen?.();

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        console.log('SSE 스트림 종료');
                        setIsConnected(false);
                        onConnectionClose?.();
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('id:')) {
                            const eventId = line.substring(3).trim();
                            lastEventIdRef.current = parseInt(eventId) || undefined;
                        } else if (line.startsWith('event:')) {
                            // event 타입 확인 (notification인지)
                        } else if (line.startsWith('data:')) {
                            try {
                                const dataJson = line.substring(5).trim();
                                if (dataJson) {
                                    const data: SSENotificationData = JSON.parse(dataJson);

                                    const serverNotification: ServerNotificationItem = {
                                        id: data.id,
                                        createdAt: new Date().toISOString(),
                                        senderId: data.senderId,
                                        receiverId: data.receiverId,
                                        type: data.type,
                                        isRead: false,
                                        content: data.content
                                    };

                                    console.log('새 알림 수신:', serverNotification);
                                    onNewNotification?.(serverNotification);
                                }
                            } catch (parseError) {
                                console.error('알림 데이터 파싱 실패:', parseError);
                            }
                        }
                    }
                }
            } catch (streamError) {
                if (streamError instanceof Error && streamError.name === 'AbortError') {
                    console.log('SSE 연결이 수동으로 중단됨');
                } else {
                    throw streamError;
                }
            } finally {
                reader.releaseLock();
            }

        } catch (error) {
            console.error('SSE 연결 실패:', error);
            setIsConnected(false);
            setConnectionError(error instanceof Error ? error.message : '연결 실패');
            onError?.(error as Event);

            if (autoReconnect && !abortControllerRef.current?.signal.aborted) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('SSE 재연결 시도...');
                    connect();
                }, reconnectInterval);
            }
        }
    }, [onNewNotification, onError, onConnectionOpen, onConnectionClose, autoReconnect, reconnectInterval, cleanup]);

    const disconnect = useCallback(() => {
        cleanup();
        onConnectionClose?.();
    }, [cleanup, onConnectionClose]);

    const reconnect = useCallback(() => {
        connect();
    }, [connect]);

    useEffect(() => {
        connect();

        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && !isConnected && autoReconnect) {
                connect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isConnected, autoReconnect, connect]);

    return {
        isConnected,
        connectionError,
        connect,
        disconnect,
        reconnect
    };
};
