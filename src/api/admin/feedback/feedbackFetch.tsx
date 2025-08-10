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

// 월별 피드백 수 조회 함수입니다.
export const fetchMonthlyFeedbackCount = async (company_id: number, year: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/monthly_count?company_id=${company_id}&year=${year}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('월별 피드백 수 조회 실패');
    const data = await res.json();
    return data.result;
};

// 일별 피드백 수 조회 함수입니다.
export const fetchDailyFeedbackCount = async (company_id: number, year: number, month: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/daily_count?company_id=${company_id}&year=${year}&month=${month}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('일별 피드백 수 조회 실패');
    const data = await res.json();
    return data.result;
};

// 주별 피드백 수 조회 함수입니다.
export const fetchWeeklyFeedbackCount = async (company_id: number, year: number, month: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/weekly_count?company_id=${company_id}&year=${year}&month=${month}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('주별 피드백 수 조회 실패');
    const data = await res.json();
    return data.result;
};

// 시간별 피드백 수 조회 함수입니다.
export const fetchHourlyFeedbackCount = async (date: string, company_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/hourly_count?date=${date}&company_id=${company_id}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('시간별 피드백 수 조회 실패');
    const data = await res.json();
    return data.result;
};

// 피드백 비율 조회 함수입니다.
export const fetchFeedbackRatio = async (company_id: number, start_date: string, end_date: string) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/ratio?company_id=${company_id}&start_date=${start_date}&end_date=${end_date}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('피드백 비율 조회 실패');
    const data = await res.json();
    return data.result;
};

// 피드백 사유 목록 조회 함수입니다.
export const fetchFeedbackReasons = async () => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/reasons`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('피드백 사유 목록 조회 실패');
    return await res.json();
};

// 피드백 생성 함수입니다.
export const createFeedback = async (feedbackData: {
    chat_id: number;
    feedback_type: string;
    feedback_reason?: string;
    feedback_content?: string;
    answer: string;
}) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/feedbacks/create`,
        {
            method: 'POST',
            body: JSON.stringify(feedbackData),
        }
    );
    if (!res.ok) throw new Error('피드백 생성 실패');
    const data = await res.json();
    return data.result;
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
