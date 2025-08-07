// cookie에서 accessToken을 가져와야 하는 Middleware 방식 대신, 직접 커스텀하여 sessionStorage의 accessToken 속 role을 바탕으로 접근 제어를 관리하는 컴포넌트입니다.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeJwtRole } from '@/utils/decodeJwtRole';
import { getValidAccessToken } from '@/utils/tokenStorage';
import { ProtectedRouteProps } from "@/types/auth";

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            setIsLoading(true);
            try {
                const accessToken = await getValidAccessToken();

                if (!accessToken) {
                    console.log('No valid access token, redirecting to login');
                    router.replace('/login');
                    return;
                }

                const role = decodeJwtRole(accessToken);
                console.log('Current role:', role, 'Allowed roles:', allowedRoles);

                if (!role || !allowedRoles.includes(role)) {
                    console.log('Role not allowed, redirecting to unauthorized');
                    router.replace('/unauthorized');
                    return;
                }

                setIsAllowed(true);
            } catch (error) {
                console.error('Access check failed:', error);
                router.replace('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [allowedRoles, router]);

    if (isLoading) {
        return <div>인증 확인 중...</div>;
    }

    if (isAllowed === null || !isAllowed) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;