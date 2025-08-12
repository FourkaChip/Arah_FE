const REFRESH_TOKEN_KEY = 'refresh_token';
export const ACCESS_TOKEN_KEY = 'access_token';

export const saveRefreshToken = (token: string) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
};

export const getRefreshToken = () => {
    if (typeof window !== "undefined") {
        return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
};

export const removeRefreshToken = () => {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};

// accessToken도 sessionStorage에서 관리
export const saveAccessToken = (token: string) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
};

export const getAccessToken = () => {
    if (typeof window !== "undefined") {
        return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
};

export const removeAccessToken = () => {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
};

// JWT 토큰 만료 확인 함수
export const isTokenExpired = (token?: string): boolean => {
    const accessToken = token || getAccessToken();
    if (!accessToken) return true;

    try {
        const payload = accessToken.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp && decoded.exp < currentTime;
    } catch {
        return true;
    }
};

let reissuePromise: Promise<string | null> | null = null;

export const getValidAccessToken = async (): Promise<string | null> => {
    const currentToken = getAccessToken();

    if (currentToken && !isTokenExpired(currentToken)) {
        return currentToken;
    }

    if (reissuePromise) {
        return await reissuePromise;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        return null;
    }

    reissuePromise = (async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/reissue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) {
                removeRefreshToken();
                removeAccessToken();
                return null;
            }

            const data = await res.json();
            const newAccessToken = data.accessToken || (data.result && data.result.accessToken);

            if (newAccessToken) {
                saveAccessToken(newAccessToken);
                return newAccessToken;
            } else {
                removeRefreshToken();
                removeAccessToken();
                return null;
            }
        } catch (error) {
            removeRefreshToken();
            removeAccessToken();
            return null;
        } finally {
            reissuePromise = null;
        }
    })();

    return await reissuePromise;
};
