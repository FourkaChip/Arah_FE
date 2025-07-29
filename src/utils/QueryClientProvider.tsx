// React Query를 사용하여 서버의 각종 상태를 관리하는 컴포넌트입니다.
'use client';

import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {ReactNode, useState, useEffect} from 'react';
import {useAuthStore} from "@/store/auth.store";
import {getRefreshToken, removeRefreshToken} from "@/utils/tokenStorage";

export default function ClientProviders({children}: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    // useEffect(() => {
    //     const refreshToken = getRefreshToken();
    //     if (!refreshToken) return;
    //     // refreshToken이 있으면 accessToken 재발급 요청
    // //     fetch('/api/users/auth/refresh', {
    // //         method: 'POST',
    // //         headers: {
    // //             'Content-Type': 'application/json',
    // //         },
    // //         body: JSON.stringify({ refreshToken }),
    // //     })
    // //         .then(async (res) => {
    // //             if (!res.ok) throw new Error('Failed to refresh');
    // //             return res.json();
    // //         })
    // //         .then((data) => {
    // //             if (data && data.accessToken) {
    // //                 setAccessToken(data.accessToken);
    // //             } else {
    // //                 removeRefreshToken();
    // //             }
    // //         })
    // //         .catch(() => {
    // //             removeRefreshToken();
    // //         });
    // // }, [setAccessToken]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}