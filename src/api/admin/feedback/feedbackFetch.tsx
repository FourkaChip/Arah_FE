// 피드백 관련 API 연결 함수들입니다.

import {authorizedFetch} from "@/api/auth/authorizedFetch";

// 싫어요 피드백 목록 캐싱을 위한 변수들
let unlikeFeedbackCache: { [companyId: number]: any[] } = {};
let unlikeFeedbackPromises: { [companyId: number]: Promise<any[]> | null } = {};
let unlikeFeedbackCacheTime: { [companyId: number]: number } = {};
const UNLIKE_FEEDBACK_CACHE_DURATION = 2 * 60 * 1000;

// 회사별 싫어요 피드백 목록 조회 함수입니다.
export const fetchUnlikeFeedbackList = async (company_id: number) => {
    const now = Date.now();

    if (unlikeFeedbackCache[company_id] &&
        (now - (unlikeFeedbackCacheTime[company_id] || 0)) < UNLIKE_FEEDBACK_CACHE_DURATION) {
        return unlikeFeedbackCache[company_id];
    }

    if (unlikeFeedbackPromises[company_id]) {
        return unlikeFeedbackPromises[company_id];
    }

    unlikeFeedbackPromises[company_id] = (async () => {
        try {
            const res = await authorizedFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/unlike_feedback_list?company_id=${company_id}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );
            if (!res.ok) throw new Error('싫어요 피드백 목록 조회 실패');
            const data = await res.json();

            unlikeFeedbackCache[company_id] = data.result || [];
            unlikeFeedbackCacheTime[company_id] = Date.now();

            return data.result || [];
        } catch (error) {
            delete unlikeFeedbackCache[company_id];
            delete unlikeFeedbackCacheTime[company_id];
            throw error;
        } finally {
            delete unlikeFeedbackPromises[company_id];
        }
    })();

    return await unlikeFeedbackPromises[company_id];
};

export const clearUnlikeFeedbackCache = (company_id?: number) => {
    if (company_id) {
        delete unlikeFeedbackCache[company_id];
        delete unlikeFeedbackPromises[company_id];
        delete unlikeFeedbackCacheTime[company_id];
    } else {
        unlikeFeedbackCache = {};
        unlikeFeedbackPromises = {};
        unlikeFeedbackCacheTime = {};
    }
};

// 피드백 삭제 함수입니다.
export const deleteFeedback = async (feedback_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/delete/${feedback_id}`,
        {
            method: 'DELETE',
        }
    );
    if (!res.ok) throw new Error('피드백 삭제 실패');
    const data = await res.json();
    return data.result;
};
