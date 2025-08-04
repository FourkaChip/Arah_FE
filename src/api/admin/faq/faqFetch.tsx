// FAQ 관련 API 연결 함수들입니다.

import {authorizedFetch} from "@/api/auth/authorizedFetch";

// faq 목록 조회용 함수입니다.
export const fetchAdminFaqList = async (companyId: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/api/faq/${companyId}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('admin 목록 조회 실패');
    const data = await res.json();
    return data.result;
};
