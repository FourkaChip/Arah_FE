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

// 전체 관리자 상세 정보 조회 API 함수입니다.
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

export const clearAllAdminsCache = () => {
    allAdminsCache = null;
    allAdminsPromise = null;
    allAdminsCacheTime = 0;
};

export const clearAdminCaches = () => {
    clearCompanyAdminsCache();
    clearAllAdminsCache();
};

// 관리자 목록 조회 API 함수입니다. (기존 함수 수정)
export const fetchAdminList = async (): Promise<CombinedAdminInfo[]> => {
    try {
        // 1. 먼저 회사별 관리자 기본 정보를 가져옵니다. (userId, name, adminDepartments)
        const companyAdmins = await fetchCompanyAdmins();

        if (!companyAdmins.length) {
            return [];
        }

        // 2. 전체 관리자 상세 정보를 가져옵니다.
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
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/departments`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('관리자 부서 등록 실패');

    clearAdminCaches();

    return res.json();
};

// 관리자 권한 해제 API 함수입니다.
export const removeAdminRole = async (email: string) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/remove`, {
        method: 'PATCH',
        body: JSON.stringify({email}),
    });
    if (!res.ok) throw new Error('관리자 권한 해제 실패');

    clearAdminCaches();

    return res.json();
};
