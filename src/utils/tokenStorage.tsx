// src/utils/token-storage.ts
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

// accessToken은 메모리(상태)에서만 관리
export const saveAccessToken = (token: string) => {
    // no-op
};

export const getAccessToken = () => {
    // no-op
    return null;
};

export const removeAccessToken = () => {
    // no-op
};