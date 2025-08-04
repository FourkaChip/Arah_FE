// FAQ 관련 API 연결 함수들입니다.

import {authorizedFetch} from "@/api/auth/authorizedFetch";

// faq 목록 조회용 함수입니다.
export const fetchAdminFaqList = async (companyId: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq/${companyId}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('admin 목록 조회 실패');
    const data = await res.json();
    return data.result;
}

// FAQ 등록용 함수입니다.
export const fetchAddAdminFaq = async (companyId: number, question: string, answer: string, tag_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq/upload`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question, answer, company_id: companyId, tag_id}),
        }
    );
    if (!res.ok) throw new Error('admin faq 등록 실패');
    const data = await res.json();
    return data.result;
}

// FAQ 수정용 함수입니다.
export const fetchUpdateAdminFaq = async (faq_id: number, question: string, answer: string, tag_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq/update`,
        {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({faq_id, question, answer, tag_id}),
        }
    );
    if (!res.ok) throw new Error('admin faq 수정 실패');
    const data = await res.json();
    return data.result;
}

// FAQ 삭제용 함수입니다.
export const fetchDeleteAdminFaq = async (faq_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq/delete`,
        {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({faq_id}),
        }
    );
    if (!res.ok) throw new Error('admin faq 삭제 실패');
    const data = await res.json();
    return data.result;
}

// FAQ 태그 목록 조회용 함수입니다.
export const fetchAdminFaqTagList = async (companyId: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq-tag/${companyId}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('admin faq 태그 목록 조회 실패');
    const data = await res.json();
    return data.result;
}

// FAQ 태그 추가용 함수입니다.
export const fetchAddAdminFaqTag = async (companyId: number, tagName: string) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq-tag/upload`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: tagName, company_id: companyId}),
        }
    );
    if (!res.ok) throw new Error('admin faq 태그 추가 실패');
    const data = await res.json();
    return data.result;
}