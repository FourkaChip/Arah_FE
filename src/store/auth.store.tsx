// 로그인 auth 상태관리를 위한 zustand 스토어 파일입니다.
import {create} from 'zustand';
import {saveAccessToken, getAccessToken, removeAccessToken} from '@/utils/tokenStorage';

type AuthStore = {
    accessToken: string | null;
    setAccessToken: (token: string) => void;
    clearAccessToken: () => void;
    user: any | null;
    setUser: (user: any) => void;
    clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
    accessToken: null,
    setAccessToken: (token) => {
        saveAccessToken(token);
        set({accessToken: token});
    },
    clearAccessToken: () => {
        removeAccessToken();
        set({accessToken: null});
    },
    user: null,
    setUser: (user) => set({user}),
    clearUser: () => set({user: null}),
}));

if (typeof window !== "undefined") {
    const storedToken = getAccessToken();
    if (storedToken) {
        useAuthStore.getState().setAccessToken(storedToken);
    }
}
