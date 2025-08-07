// 마스터 로그인 관련 API 함수들입니다.

import {CombinedAdminInfo} from "@/types/tables";
import {authorizedFetch} from "@/api/auth/authorizedFetch";

// 마스터 로그인 함수입니다.
export const masterLogin = async (email: string, password: string, companyName: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, companyName}),
    });

    if (!res.ok) {
        if (res.status === 400) {
            const errorData = await res.json();
            const error = new Error('로그인 실패');
            (error as any).response = { data: errorData };
            throw error;
        }
        throw new Error('로그인 실패');
    }

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

    if (!res.ok) {
        if (res.status === 403) {
            const errorData = await res.json();
            const error = new Error('인증 실패');
            (error as any).response = { data: errorData };
            throw error;
        }
        throw new Error('인증 실패');
    }

    return (await res.json()).result;
};

// 현재 로그인한 사용자 정보 조회 함수입니다.
export const fetchCurrentUserInfo = async () => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`, {
        method: 'GET',
    });

    if (!res.ok) throw new Error('사용자 정보를 불러올 수 없습니다.');
    const data = await res.json();
    if (!data.result) throw new Error('사용자 정보가 없습니다.');
    return data.result;
};

// 이메일 기반 사용자 정보 조회 함수입니다.
export const fetchUserInfoByEmail = async (email: string, currentCompanyId?: number) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/info/${email}`, {
        method: 'GET',
    });
    if (!res.ok) throw new Error('사용자 정보를 불러올 수 없습니다.');
    const data = await res.json();
    if (!data.result) throw new Error('사용자 정보가 없습니다.');

    if (currentCompanyId !== undefined && data.result.companyId !== undefined) {
        if (data.result.companyId !== currentCompanyId) {
            throw new Error('등록되지 않은 사용자입니다.');
        }
    }

    return data.result;
};
