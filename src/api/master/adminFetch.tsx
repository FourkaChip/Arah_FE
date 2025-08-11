// 회사별 관리자 기본 정보 조회 API 함수입니다.
import {authorizedFetch} from "@/api/auth/authorizedFetch";
import {CombinedAdminInfo} from "@/types/tables";

let companyAdminsCache: any[] | null = null;
let companyAdminsPromise: Promise<any[]> | null = null;
let companyAdminsCacheTime: number = 0;
const COMPANY_ADMINS_CACHE_DURATION = 3 * 60 * 1000;

let allAdminsCache: any[] | null = null;
let allAdminsPromise: Promise<any[]> | null = null;
let allAdminsCacheTime: number = 0;
const ALL_ADMINS_CACHE_DURATION = 3 * 60 * 1000;

export const fetchCompanyAdmins = async () => {
    const now = Date.now();

    if (companyAdminsCache && (now - companyAdminsCacheTime) < COMPANY_ADMINS_CACHE_DURATION) {
        return companyAdminsCache;
    }

    if (companyAdminsPromise) {
        return await companyAdminsPromise;
    }

    companyAdminsPromise = (async () => {
        try {
            const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/admins`, {
                method: 'GET',
            });

            if (!res.ok) throw new Error('회사별 관리자 목록 조회 실패');
            const json = await res.json();

            companyAdminsCache = json.result || [];
            companyAdminsCacheTime = Date.now();

            return json.result || [];
        } catch (error) {
            companyAdminsCache = null;
            companyAdminsCacheTime = 0;
            throw error;
        } finally {
            companyAdminsPromise = null;
        }
    })();

    return await companyAdminsPromise;
};

// 전체 관리자 상세 정보 조회 API 함수입니다. (이제 사용하지 않음)
export const fetchAllAdmins = async () => {
    const now = Date.now();

    if (allAdminsCache && (now - allAdminsCacheTime) < ALL_ADMINS_CACHE_DURATION) {
        return allAdminsCache;
    }

    if (allAdminsPromise) {
        return await allAdminsPromise;
    }

    allAdminsPromise = (async () => {
        try {
            const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins`, {
                method: 'GET',
            });
            if (!res.ok) throw new Error('전체 관리자 목록 조회 실패');
            const json = await res.json();

            allAdminsCache = json.result || [];
            allAdminsCacheTime = Date.now();

            return json.result || [];
        } catch (error) {
            allAdminsCache = null;
            allAdminsCacheTime = 0;
            throw error;
        } finally {
            allAdminsPromise = null;
        }
    })();

    return await allAdminsPromise;
};

export const clearCompanyAdminsCache = () => {
    companyAdminsCache = null;
    companyAdminsPromise = null;
    companyAdminsCacheTime = 0;
};

// 관리자 목록 조회 API 함수입니다.
export const fetchAdminList = async (): Promise<CombinedAdminInfo[]> => {
    try {
        const companyAdmins = await fetchCompanyAdmins();

        return companyAdmins.map((admin: any) => ({
            userId: admin.userId,
            name: admin.name,
            email: admin.email,
            position: admin.position,
            createdAt: admin.createdAt,
            adminDepartments: admin.adminDepartments || [],
        })) as CombinedAdminInfo[];
    } catch (error) {
        throw new Error('관리자 목록 조회 실패');
    }
};

// 관리자 부서 등록(업데이트) API 함수입니다.
export const assignAdminRole = async (payload: { departmentIds: number[]; userId: number }[]) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/departments`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('관리자 부서 등록 실패');

    clearCompanyAdminsCache();

    return res.json();
};

// 관리자 권한 해제 API 함수입니다.
export const removeAdminRole = async (email: string) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/remove`, {
        method: 'PATCH',
        body: JSON.stringify({email}),
    });
    if (!res.ok) throw new Error('관리자 권한 해제 실패');

    clearCompanyAdminsCache();

    return res.json();
};
