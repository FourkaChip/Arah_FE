// src/api/admin/analyze/analyzeFetch.tsx
import { authorizedFetch } from '@/api/auth/authorizedFetch';
import { decodeJwtRole } from '@/utils/decodeJwtRole';
import { getAccessToken } from '@/utils/tokenStorage';
import type { SatisfactionApiResult } from '@/types/analyze';

// 회사 가입일 캐시
let companyCreatedAtCache: string | null = null;
let companyCreatedAtPromise: Promise<string> | null = null;

// 회사 가입일 조회
export async function fetchCompanyCreatedAt(): Promise<string> {
  // 캐시된 값이 있으면 반환
  if (companyCreatedAtCache) {
    return companyCreatedAtCache;
  }

  // 진행 중인 요청이 있으면 기다림
  if (companyCreatedAtPromise) {
    return await companyCreatedAtPromise;
  }

  // 새 요청 시작
  companyCreatedAtPromise = (async () => {
    const res = await authorizedFetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/created-at`,
      { method: 'GET', cache: 'no-store' }
    );
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      companyCreatedAtPromise = null; // 실패 시 캐시 초기화
      throw new Error(text || `HTTP ${res.status}`);
    }
    
    const json = await res.json();
    const createdAt = json?.result?.createdAt;
    
    if (!createdAt) {
      companyCreatedAtPromise = null; // 실패 시 캐시 초기화
      throw new Error('가입일 정보를 찾을 수 없습니다.');
    }
    
    // ISO 날짜를 YYYY-MM-DD 형식으로 변환
    const date = new Date(createdAt);
    const formattedDate = date.toISOString().split('T')[0];
    
    // 캐시에 저장
    companyCreatedAtCache = formattedDate;
    companyCreatedAtPromise = null;
    
    return formattedDate;
  })();

  return await companyCreatedAtPromise;
}

// 시간별 피드백 수 조회
export async function fetchFeedbackHourlyCount({ date, signal }: { date: string; signal?: AbortSignal }) {
  const qs = new URLSearchParams({ date });
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
export async function fetchFeedbackDailyCount({ year, month, signal }: { year: number; month: number; signal?: AbortSignal }) {
  const qs = new URLSearchParams({
    year: String(year),
    month: String(month),
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
export async function fetchFeedbackWeeklyCount({ year, month, signal }: { year: number; month: number; signal?: AbortSignal }) {
  const qs = new URLSearchParams({
    year: String(year),
    month: String(month),
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
export async function fetchFeedbackMonthlyCount({ year, signal }: { year: number; signal?: AbortSignal }) {
  const qs = new URLSearchParams({ year: String(year) });
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

// 키워드 TOP 10 조회
export async function fetchTopKeywords({
  startDate,
  endDate,
  signal,
}: {
  startDate: string;
  endDate: string;
  signal?: AbortSignal;
}) {
  // 토큰에서 company_id 추출
  const token = getAccessToken();
  if (!token) {
    throw new Error('인증 토큰이 없습니다.');
  }
  
  const payload = decodeJwtRole(token);
  const companyId = payload?.company_id;
  
  if (!companyId) {
    throw new Error('회사 정보를 찾을 수 없습니다.');
  }

  const qs = new URLSearchParams({
    company_id: String(companyId),
    start_date: startDate,
    end_date: endDate,
  });

  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/api/ai/feedbacks/top?${qs}`,
    { method: 'GET', cache: 'no-store', signal }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return json?.result ?? json;
}

// 만족도 비율 조회
export async function fetchSatisfactionRaw({
  startDate,
  endDate,
  signal,
}: {
  startDate: string;
  endDate: string;
  signal?: AbortSignal;
}): Promise<SatisfactionApiResult> {
  const qs = new URLSearchParams({
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
  return json?.result ?? json;
}