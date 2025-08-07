// cookie에서 accessToken을 가져와야 하는 Middleware 방식 대신, 직접 커스텀하여 sessionStorage의 accessToken 속 role을 바탕으로 접근 제어를 관리하는 컴포넌트입니다.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeJwtRole } from '@/utils/decodeJwtRole';
import { getAccessToken } from '@/utils/tokenStorage';
import {ProtectedRouteProps} from "@/types/auth";


const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const router = useRouter();

    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            router.replace('/unauthorized');
            return;
        }

        const role = decodeJwtRole(accessToken);
        if (!role || !allowedRoles.includes(role)) {
            router.replace('/unauthorized');
            return;
        }

        setIsAllowed(true);
    }, [allowedRoles, router]);

    if (isAllowed === null) return null;

    return <>{children}</>;
};

export default ProtectedRoute;