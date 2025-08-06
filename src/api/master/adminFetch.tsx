// 회사별 관리자 기본 정보 조회 API 함수입니다.
import {authorizedFetch} from "@/api/auth/authorizedFetch";
import {CombinedAdminInfo} from "@/types/tables";

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
