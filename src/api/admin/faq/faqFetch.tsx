// FAQ 관련 API 연결 함수들입니다.

import {authorizedFetch} from "@/api/auth/authorizedFetch";

let faqListCache: any[] | null = null;
let faqListPromise: Promise<any[]> | null = null;
let faqListCacheTime: number = 0;
const FAQ_LIST_CACHE_DURATION = 3 * 60 * 1000;

let faqTagListCache: any[] | null = null;
let faqTagListPromise: Promise<any[]> | null = null;
let faqTagListCacheTime: number = 0;
const FAQ_TAG_LIST_CACHE_DURATION = 5 * 60 * 1000;

// faq 목록 조회용 함수입니다.
export const fetchAdminFaqList = async () => {
    const now = Date.now();

    if (faqListCache && (now - faqListCacheTime) < FAQ_LIST_CACHE_DURATION) {
        return faqListCache;
    }

    if (faqListPromise) {
        return await faqListPromise;
    }

    faqListPromise = (async () => {
        try {
            const res = await authorizedFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );
            if (!res.ok) throw new Error('admin 목록 조회 실패');
            const data = await res.json();

            faqListCache = data.result;
            faqListCacheTime = Date.now();

            return data.result;
        } catch (error) {
            faqListCache = null;
            faqListCacheTime = 0;
            throw error;
        } finally {
            faqListPromise = null;
        }
    })();

    return await faqListPromise;
}

export const fetchAdminFaqTagList = async () => {
    const now = Date.now();

    if (faqTagListCache && (now - faqTagListCacheTime) < FAQ_TAG_LIST_CACHE_DURATION) {
        return faqTagListCache;
    }

    if (faqTagListPromise) {
        return await faqTagListPromise;
    }

    faqTagListPromise = (async () => {
        try {
            const res = await authorizedFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/faq-tag`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );
            if (!res.ok) throw new Error('admin faq 태그 목록 조회 실패');
            const data = await res.json();

            faqTagListCache = data.result;
            faqTagListCacheTime = Date.now();

            return data.result;
        } catch (error) {
            faqTagListCache = null;
            faqTagListCacheTime = 0;
            throw error;
        } finally {
            faqTagListPromise = null;
        }
    })();

    return await faqTagListPromise;
}

export const clearFaqListCache = () => {
    faqListCache = null;
    faqListPromise = null;
    faqListCacheTime = 0;
};

export const clearFaqTagListCache = () => {
    faqTagListCache = null;
    faqTagListPromise = null;
    faqTagListCacheTime = 0;
};

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

    clearFaqListCache();

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

    clearFaqListCache();

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

    clearFaqListCache();

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

    clearFaqTagListCache();

    return data.result;
}