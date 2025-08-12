'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { ServerNotificationItem } from '@/api/admin/noti/notiFetch';
import { getValidAccessToken } from '@/utils/tokenStorage';
import { EventSourcePolyfill } from 'event-source-polyfill';

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

// 전역 단일 인스턴스 관리
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
                console.log('🔌 SSE 연결 정리');
                esRef.current.close();
                globalSSEInstance = null;
            }
        } catch {}
        esRef.current = null;
        connectingRef.current = false;
        globalConnectionAttempts = 0;
        if (mountedRef.current) {
            setIsConnected(false);
        }
    }, []);

    const connect = useCallback(async () => {
        // 이미 연결 시도 중이거나 최대 시도 횟수 초과
        if (connectingRef.current || globalConnectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
            console.log('🚫 SSE 연결 중복 시도 방지 - connectingRef:', connectingRef.current, 'attempts:', globalConnectionAttempts);
            return;
        }

        // 기존 연결이 살아있으면 재사용
        if (globalSSEInstance && globalSSEInstance.readyState === EventSourcePolyfill.OPEN) {
            console.log('♻️ 기존 SSE 연결 재사용');
            esRef.current = globalSSEInstance;
            setIsConnected(true);
            setConnectionError(null);
            onConnectionOpen?.();
            return;
        }

        // 컴포넌트가 언마운트된 경우 연결하지 않음
        if (!mountedRef.current) {
            console.log('🚫 컴포넌트 언마운트됨 - SSE 연결 중단');
            return;
        }

        connectingRef.current = true;
        globalConnectionAttempts += 1;
        setConnectionError(null);

        console.log(`🔄 SSE 연결 시도 #${globalConnectionAttempts}`);

        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error('인증 토큰이 없습니다.');

            const NOTI_API_BASE_URL = process.env.NEXT_PUBLIC_NOTI_API_BASE_URL;
            if (!NOTI_API_BASE_URL) throw new Error('NOTI API URL이 설정되지 않았습니다.');

            const params = new URLSearchParams({ token });
            if (lastEventIdRef.current) {
                params.append('lastEventId', String(lastEventIdRef.current));
            }

            const headers: Record<string, string> = {
                Accept: 'text/event-stream',
                Authorization: `Bearer ${token}`,
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
                console.log('✅ SSE 연결 성공');
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
                    };
                    onNewNotification?.(serverNotification);
                } catch (err) {
                    console.error('❌ 알림 데이터 파싱 실패:', err);
                }
            });

            es.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.success === false && data.code && data.message) {
                        console.error('❌ 서버 에러:', data.message);
                        if (mountedRef.current) {
                            setConnectionError(`서버 에러: ${data.message}`);
                        }
                        es.close();
                        return;
                    }
                } catch (err) {
                    // JSON이 아닌 메시지는 무시
                }
            };

            es.onerror = (event: Event) => {
                console.error('❌ SSE 연결 에러');
                connectingRef.current = false;
                if (mountedRef.current) {
                    setIsConnected(false);
                    setConnectionError('연결 오류');
                    onError?.(event);
                }

                // 자동 재연결 비활성화 - 수동으로만 재연결
                if (!autoReconnect) {
                    es.close();
                    globalSSEInstance = null;
                    globalConnectionAttempts = 0;
                }
            };

        } catch (error) {
            console.error('❌ SSE 연결 초기화 실패:', error);
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
        console.log('🔌 SSE 수동 연결 해제');
        cleanup();
        onConnectionClose?.();
    }, [cleanup, onConnectionClose]);

    const reconnect = useCallback(() => {
        console.log('🔄 SSE 수동 재연결');
        cleanup();
        // 재연결 시 시도 횟수 리셋
        globalConnectionAttempts = 0;
        connect();
    }, [cleanup, connect]);

    // 컴포넌트 마운트 시 한 번만 연결
    useEffect(() => {
        mountedRef.current = true;

        // 이미 연결을 시도했거나 성공한 경우 중복 방지
        if (!hasConnectedRef.current && globalConnectionAttempts === 0) {
            console.log('🚀 최초 SSE 연결 시도');
            connect();
        } else if (globalSSEInstance && globalSSEInstance.readyState === EventSourcePolyfill.OPEN) {
            console.log('♻️ 기존 연결 재사용');
            esRef.current = globalSSEInstance;
            setIsConnected(true);
        }

        return () => {
            console.log('🧹 컴포넌트 언마운트 - SSE 정리');
            mountedRef.current = false;
            // cleanup(); // 글로벌 인스턴스는 유지
        };
    }, []); // 빈 dependency array로 한 번만 실행

    // 페이지 가시성 변경 시에도 중복 연결 방지
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && !isConnected && !connectingRef.current && mountedRef.current) {
                // 일정 시간 후에만 재연결 시도
                setTimeout(() => {
                    if (globalConnectionAttempts === 0) {
                        console.log('👁️ 페이지 가시성 변경으로 인한 재연결');
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
