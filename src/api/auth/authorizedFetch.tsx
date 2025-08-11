// 모든 API Fetching 함수에서 공통으로 사용될 JWT 인증 함수입니다.
import {useAuthStore} from "@/store/auth.store";
import {getValidAccessToken} from "@/utils/tokenStorage";

export const authorizedFetch = async (
    input: RequestInfo,
    init: RequestInit = {},
): Promise<Response> => {
    const token = await getValidAccessToken();
    console.log('[authorizedFetch] input:', input);
    console.log('[authorizedFetch] token:', token);
    if (!token) {
        console.error('[authorizedFetch] 인증 토큰 없음');
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const customHeaders = init.headers instanceof Headers
        ? init.headers
        : new Headers(init.headers);

    customHeaders.set('Authorization', `Bearer ${token}`);

    if (!customHeaders.has('Content-Type') && !(init.body instanceof FormData)) {
        customHeaders.set('Content-Type', 'application/json');
    }

    console.log('[authorizedFetch] fetch url:', input);
    const response = await fetch(input, {
        ...init,
        headers: customHeaders,
    });

    if (response.status === 401) {
        useAuthStore.getState().clearAccessToken();
        console.error('[authorizedFetch] 401 Unauthorized');
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    return response;
};

// 로그아웃 함수입니다.
export const logout = async () => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/logout`, {
        method: 'POST',
    });

    if (!res.ok) {
        throw new Error('로그아웃 실패');
    }

    return res.json();
};