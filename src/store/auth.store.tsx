// 로그인 auth 상태관리를 위한 zustand 스토어 파일입니다.
import {create} from 'zustand';

type AuthStore = {
    accessToken: string | null;
    setAccessToken: (token: string) => void;
    clearAccessToken: () => void;
    user: any | null;
    setUser: (user: any) => void;
    clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,
    setAccessToken: (token) => set({accessToken: token}),
    clearAccessToken: () => set({accessToken: null}),
    user: null,
    setUser: (user) => set({user}),
    clearUser: () => set({user: null}),
}));