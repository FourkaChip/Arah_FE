// 로그인 auth 상태관리를 위한 zustand 스토어 파일입니다.
import { create } from 'zustand';
import {ACCESS_TOKEN_KEY} from "@/utils/tokenStorage";

type AuthStore = {
    accessToken: string | null;
    setAccessToken: (token: string) => void;
    clearAccessToken: () => void;
};

// export const useAuthStore = create<AuthStore>((set) => ({
//     accessToken: null,
//     setAccessToken: (token) => set({ accessToken: token }),
//     clearAccessToken: () => set({ accessToken: null }),
// }));

// access token 관련 재발급 로직 구현 전 임시 사용
export const useAuthStore = create<AuthStore>((set) => ({
    accessToken: typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null,
    setAccessToken: (token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
        }
        set({ accessToken: token });
    },
    clearAccessToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
        set({ accessToken: null });
    },
}));