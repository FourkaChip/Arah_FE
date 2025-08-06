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