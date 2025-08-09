// cookie에서 accessToken을 가져와야 하는 Middleware 방식 대신, 직접 커스텀하여 sessionStorage의 accessToken 속 role을 바탕으로 접근 제어를 관리하는 컴포넌트입니다.
'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {decodeJwtRole} from '@/utils/decodeJwtRole';
import {getValidAccessToken} from '@/utils/tokenStorage';
import {ProtectedRouteProps} from "@/types/auth";

const ProtectedRoute = ({allowedRoles, children}: ProtectedRouteProps) => {
    const router = useRouter();

    const [allowed, setAllowed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const token = sessionStorage.getItem('accessToken');
        if (!token) return false;
        const role = decodeJwtRole(token);
        return !!role && allowedRoles.includes(role);
    });

    const [checkedOnce, setCheckedOnce] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const token = await getValidAccessToken();
                if (!token) {
                    if (!cancelled) router.replace('/login');
                    return;
                }

                const role = decodeJwtRole(token);
                if (!role || !allowedRoles.includes(role)) {
                    if (!cancelled) router.replace('/unauthorized');
                    return;
                }

                if (!cancelled) setAllowed(true);
            } catch (e) {
                if (!cancelled) router.replace('/login');
            } finally {
                if (!cancelled) setCheckedOnce(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [allowedRoles, router]);

    if (!allowed && !checkedOnce) {
        return null;
    }

    return allowed ? <>{children}</> : null;
};

export default ProtectedRoute;
