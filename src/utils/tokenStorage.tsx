// src/utils/token-storage.ts
const REFRESH_TOKEN_KEY = 'refresh_token';

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