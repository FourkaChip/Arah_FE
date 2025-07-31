// React Query를 사용하여 서버의 각종 상태를 관리하는 컴포넌트입니다.
'use client';

import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {ReactNode, useState, useEffect} from 'react';
import {useAuthStore} from "@/store/auth.store";
import {getRefreshToken, removeRefreshToken} from "@/utils/tokenStorage";

export default function ClientProviders({children}: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    useEffect(() => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return;
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/reissue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to refresh');
                return res.json();
            })
            .then((data) => {
                // 백엔드 응답: { accessToken: ... } 또는 { result: { accessToken: ... } }
                const newAccessToken = data.accessToken || (data.result && data.result.accessToken);
                if (newAccessToken) {
                    setAccessToken(newAccessToken);
                } else {
                    removeRefreshToken();
                }
            })
            .catch(() => {
                removeRefreshToken();
            });
    }, [setAccessToken]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}