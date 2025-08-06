// 부서 리스트 조회 함수입니다.
import {authorizedFetch} from "@/api/auth/authorizedFetch";

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

// 부서 삭제 함수입니다.
export const deleteDepartment = async (departmentId: number) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/departments/${departmentId}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        try {
            const errorData = await res.json();
            throw new Error(errorData.message || '부서 삭제 실패');
        } catch (e) {
            throw new Error('부서 삭제 실패');
        }
    }

    return res.json();
};

// 기업 토큰 조회 함수입니다.
export const fetchCompanyToken = async (): Promise<string> => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/token`, {
        method: 'GET',
    });
    if (!res.ok) throw new Error('회사 토큰 조회 실패');
    const data = await res.json();
    if (!data.result) throw new Error('회사 토큰이 없습니다.');
    return data.result.companyToken;
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