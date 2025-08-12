// src/api/admin/analyze/analyzeFetch.tsx
import { authorizedFetch } from '@/api/auth/authorizedFetch';
import type { SatisfactionApiResult } from '@/types/analyze';

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