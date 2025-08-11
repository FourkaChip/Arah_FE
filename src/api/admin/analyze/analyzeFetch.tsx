// 시간별 피드백 수 조회
export async function fetchFeedbackHourlyCount({ date, companyId, signal }: { date: string; companyId: number; signal?: AbortSignal }) {
  const qs = new URLSearchParams({
    date,
    company_id: String(companyId),
  });
  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/api/ai/feedbacks/hourly_count?${qs}`,
    { method: 'GET', cache: 'no-store', signal }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json?.result ?? json;
}

// 일별 피드백 수 조회
export async function fetchFeedbackDailyCount({ year, month, companyId, signal }: { year: number; month: number; companyId: number; signal?: AbortSignal }) {
  const qs = new URLSearchParams({
    year: String(year),
    month: String(month),
    company_id: String(companyId),
  });
  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/api/ai/feedbacks/daily_count?${qs}`,
    { method: 'GET', cache: 'no-store', signal }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json?.result ?? json;
}

// 주별 피드백 수 조회
export async function fetchFeedbackWeeklyCount({ year, month, companyId, signal }: { year: number; month: number; companyId: number; signal?: AbortSignal }) {
  const qs = new URLSearchParams({
    year: String(year),
    month: String(month),
    company_id: String(companyId),
  });
  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/api/ai/feedbacks/weekly_count?${qs}`,
    { method: 'GET', cache: 'no-store', signal }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json?.result ?? json;
}

// 월별 피드백 수 조회
export async function fetchFeedbackMonthlyCount({ year, companyId, signal }: { year: number; companyId: number; signal?: AbortSignal }) {
  const qs = new URLSearchParams({
    year: String(year),
    company_id: String(companyId),
  });
  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/api/ai/feedbacks/monthly_count?${qs}`,
    { method: 'GET', cache: 'no-store', signal }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json?.result ?? json;
}
import { getValidAccessToken } from '@/utils/tokenStorage';
import { decodeJwtRole } from '@/utils/decodeJwtRole';

// accessToken에서 companyId를 추출하는 함수
export async function getCompanyIdFromToken(): Promise<number | undefined> {
  const token = await getValidAccessToken();
  if (!token) return undefined;
  const payload = decodeJwtRole(token);
  return payload?.company_id;
}
// src/api/admin/analyze/analyzeFetch.ts
import { authorizedFetch } from '@/api/auth/authorizedFetch';

export type SatisfactionRaw = {
  type: '만족' | '불만족';
  value: number;
  percentage: number;
};

export function convertSatisfactionResultToRows(result: {
  like_count: number;
  unlike_count: number;
  like_ratio: number;
  unlike_ratio: number;
}): SatisfactionRaw[] {
  return [
    { type: '만족', value: result.like_count, percentage: result.like_ratio },
    { type: '불만족', value: result.unlike_count, percentage: result.unlike_ratio },
  ];
}

type FetchParams = {
  startDate: string;
  endDate: string;
  companyId: number;
  signal?: AbortSignal;
};

export type SatisfactionApiResult = {
  like_count: number;
  unlike_count: number;
  total_count: number;
  like_ratio: number;
  unlike_ratio: number;
};

export async function fetchSatisfactionRaw({
  startDate,
  endDate,
  companyId,
  signal,
}: FetchParams): Promise<SatisfactionApiResult> {
  const qs = new URLSearchParams({
    company_id: String(companyId),
    start_date: startDate,
    end_date: endDate,
  });

  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/api/ai/feedbacks/ratio?${qs}`,
    { method: 'GET', cache: 'no-store', signal }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  // 원본 그대로: result가 있으면 result, 없으면 전체 json
  return json?.result ?? json;
}