// 모든 API Fetching 함수에서 공통으로 사용될 JWT 인증 함수입니다.
import {useAuthStore} from "@/store/auth.store";
import {getRefreshToken, getAccessToken} from "@/utils/tokenStorage";

export const authorizedFetch = async (
    input: RequestInfo,
    init: RequestInit = {},
): Promise<Response> => {
    let token = useAuthStore.getState().accessToken || getAccessToken();

    if (!token) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/reissue`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({refreshToken}),
            });
            if (res.ok) {
                const data = await res.json();
                const newToken = data.accessToken || (data.result && data.result.accessToken);
                if (newToken) {
                    useAuthStore.getState().setAccessToken(newToken);
                    token = newToken;
                } else {
                    throw new Error('accessToken 재발급 실패');
                }
            } else {
                throw new Error('accessToken 재발급 실패');
            }
        }
    }

    const customHeaders = init.headers instanceof Headers
        ? init.headers
        : new Headers(init.headers);

    // Authorization 헤더 설정
    if (token && !customHeaders.has('Authorization')) {
        customHeaders.set('Authorization', `Bearer ${token}`);
    }

    // FormData가 아닌 경우에만 Content-Type을 application/json으로 설정
    if (!customHeaders.has('Content-Type') && !(init.body instanceof FormData)) {
        customHeaders.set('Content-Type', 'application/json');
    }

    return fetch(input, {
        ...init,
        headers: customHeaders,
    });
};
