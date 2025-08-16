// 세션스토리지의 토큰 유무를 판단하여 로그인 페이지로의 리다이렉트를 막는 컴포넌트입니다.
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginFormRedirectGuard({ redirectTo }: { redirectTo: string }) {
    const router = useRouter();
    useEffect(() => {
        const accessToken = sessionStorage.getItem("access_token");
        const refreshToken = sessionStorage.getItem("refresh_token");
        if (accessToken || refreshToken) {
            router.replace(redirectTo);
        }
    }, [router, redirectTo]);
    return null;
}

