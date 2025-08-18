// React Query를 사용하여 서버의 각종 상태를 관리하는 컴포넌트입니다.
'use client';

import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {ReactNode, useState, useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {useAuthStore} from "@/store/auth.store";
import {getValidAccessToken, removeRefreshToken, removeAccessToken} from "@/utils/tokenStorage";

export default function ClientProviders({children}: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const validToken = await getValidAccessToken();
                if (validToken) {
                    setAccessToken(validToken);
                } else {
                    // 유효한 토큰이 없는 경우 모든 토큰 제거
                    removeRefreshToken();
                    removeAccessToken();
                }
            } catch (error) {
                removeRefreshToken();
                removeAccessToken();
            }
        };

        initializeAuth();
    }, [setAccessToken]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '14px',
                        padding: '12px 16px',
                        maxWidth: '400px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                    loading: {
                        iconTheme: {
                            primary: '#3B82F6',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </QueryClientProvider>
    );
}
