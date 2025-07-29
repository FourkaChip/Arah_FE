// 마스터 로그인 관련 API 함수들입니다.

// 마스터 로그인 함수입니다.
import {getAccessToken} from "@/utils/tokenStorage";

export const masterLogin = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
    });
    if (!res.ok) throw new Error('로그인 실패');
    return (await res.json()).result;
};

// 마스터 로그인 시 2차 인증을 위한 이메일 전송 함수입니다.
export const sendMasterVerifyCode = async (verifyToken: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/verify-code/send`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${verifyToken}`,
        },
    });

    if (!res.ok) throw new Error('인증번호 전송 실패');
    return (await res.json()).result;
};

// 마스터 인증 코드 확인 함수입니다.
export const confirmMasterVerifyCode = async ({
                                                  code,
                                                  verifyToken,
                                              }: {
    code: string;
    verifyToken: string;
}) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/verify-code/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${verifyToken}`,
        },
        body: JSON.stringify({code}),
    });
    if (!res.ok) throw new Error('인증 실패');
    return (await res.json()).result;
};

// 관리자 목록 조회 API 함수입니다.
export const fetchAdminList = async () => {
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins`, {
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // });
    // accessToken 재발급 로직 전 임시 사용
    const accessToken = getAccessToken();
    console.log("accessToken from localStorage:", accessToken);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins`, {
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
    });

    if (!res.ok) throw new Error('관리자 목록 조회 실패');
    return res.json();
};

// 관리자 권한 부여 API 함수입니다.
export const assignAdminRole = async (email: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/assign`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('관리자 권한 부여 실패');
    return res.json();
};

// 관리자 권한 해제 API 함수입니다.
export const removeAdminRole = async (email: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/remove`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('관리자 권한 해제 실패');
    return res.json();
};
