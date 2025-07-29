// src/utils/token-storage.ts
const REFRESH_TOKEN_KEY = 'refresh_token';
export const ACCESS_TOKEN_KEY = 'access_token';

export const saveRefreshToken = (token: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
};

export const getRefreshToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
};

export const removeRefreshToken = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};

// access token 관련 재발급 로직 구현 전 임시 사용
export const saveAccessToken = (token: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
};

export const getAccessToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
};

export const removeAccessToken = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
};