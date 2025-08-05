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
    if (!res.ok) throw new Error('인증 실패');
    return (await res.json()).result;
};

// 회사별 관리자 기본 정보 조회 API 함수입니다.
export const fetchCompanyAdmins = async () => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/admins`, {
        method: 'GET',
    });

    if (!res.ok) throw new Error('회사별 관리자 목록 조회 실패');
    const json = await res.json();
    return json.result || [];
};

// 전체 관리자 상세 정보 조회 API 함수입니다.
export const fetchAllAdmins = async () => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins`, {
        method: 'GET',
    });
    if (!res.ok) throw new Error('전체 관리자 목록 조회 실패');
    const json = await res.json();
    return json.result || [];
};

// 관리자 목록 조회 API 함수입니다. (기존 함수 수정)
export const fetchAdminList = async (): Promise<CombinedAdminInfo[]> => {
    try {
        // 1. 먼저 회사별 관리자 기본 정보를 가져옵니다. (userId, name, adminDepartments)
        const companyAdmins = await fetchCompanyAdmins();

        if (!companyAdmins.length) {
            return [];
        }

        // 2. 전체 관리자 상세 정보를 가져��니다.
        const allAdmins = await fetchAllAdmins();

        // 3. 회사별 관리자의 userIds를 추출합니다.
        const companyAdminUserIds = companyAdmins.map((admin: any) => admin.userId);

        // 4. 전체 관리자 정보에서 회사별 관리자에 해당하는 정보를 필터링합니다.
        const filteredAdmins = allAdmins.filter((admin: any) =>
            companyAdminUserIds.includes(admin.userId)
        );

        // 5. 두 정보를 병합합니다.
        return companyAdmins.map((companyAdmin: any) => {
            const adminDetails = filteredAdmins.find((admin: any) => admin.userId === companyAdmin.userId) || {};
            return {
                ...adminDetails,
                ...companyAdmin,
                adminDepartments: companyAdmin.adminDepartments || [],
            };
        }) as CombinedAdminInfo[];
    } catch (error) {
        const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins`);
        if (!res.ok) throw new Error('관리자 목록 조회 실패');
        const json = await res.json();
        return (json.result || []).map((admin: any) => ({
            ...admin,
            adminDepartments: admin.departmentName ? [admin.departmentName] : [],
        })) as CombinedAdminInfo[];
    }
};

// 관리자 부서 등록(업데이트) API 함수입니다.
export const assignAdminRole = async (payload: { departmentIds: number[]; userId: number }[]) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/admin/departments`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('관리자 부서 등록 실패');
    return res.json();
};

// 관리자 권한 해제 API 함수입니다.
export const removeAdminRole = async (email: string) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/remove`, {
        method: 'PATCH',
        body: JSON.stringify({email}),
    });
    if (!res.ok) throw new Error('관리자 권한 해제 실패');
    return res.json();
};

// 현재 로그인한 사용자 정보 조회 함수입니��.
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

// 부서 리스트 조회 함수입니다.
export const fetchDepartmentList = async () => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/departments/list`, {
        method: 'GET',
    });
    if (!res.ok) throw new Error('부서 리스트 조회 실패');
    const data = await res.json();
    if (!data.result) throw new Error('부서 리스트가 없습니다.');

    return data.result;
};

// 부서 생성 함수입니다.
export const createDepartment = async (name: string, companyId: number) => {

    if (!name) {
        throw new Error('부서명은 필수 입력값입니다.');
    }

    if (!companyId) {
        throw new Error('회사 정보를 가져올 수 없습니다.');
    }

    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/departments`, {
        method: 'POST',
        body: JSON.stringify({name, companyId}),
    });

    if (!res.ok) {
        try {
            const errorData = await res.json();
            throw new Error(errorData.message || '부서 생성 실패');
        } catch (e) {
            throw new Error('부서 생성 실패');
        }
    }

    const responseData = await res.json();
    return responseData.result;
};

// 기업 토큰 조회 함수입니다.
export const fetchCompanyToken = async (): Promise<string> => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/token`, {
        method: 'GET',
    });
    if (!res.ok) throw new Error('회사 토큰 조회 실패');
    const data = await res.json();
    if (!data.result) throw new Error('회사 토큰이 없습니다.');
    return data.result;
};

// 기업 토큰 등록 함수입니다.
export const registerCompanyToken = async (token: string) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/token`, {
        method: 'POST',
        body: JSON.stringify({companyToken: token}),
    });
    if (!res.ok) throw new Error('회사 토큰 등록 실패');
    return res.json();
};
