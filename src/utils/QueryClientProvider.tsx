// React Query를 사용하여 서버의 각종 상태를 관리하는 컴포넌트입니다.
'use client';

import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {ReactNode, useState, useEffect} from 'react';
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
        </QueryClientProvider>
    );
}
