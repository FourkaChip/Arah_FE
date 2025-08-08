// src/constants/dummydata/DummyAnalyze.ts
// [FIX] 파일 내 JSX 사용 없음 → .tsx가 아닌 .ts 사용을 권장합니다.

import {
  FeedbackTrendData,
  FeedbackPeriod,
  DailyFeedbackData,
  WeeklyFeedbackData,
  HourlyFeedbackData,
  DailyFeedbackTypeData,
  FeedbackTypeData,
  DailyKeywordData,
  KeywordData,
  DailySatisfactionData,
  SatisfactionData,
} from '@/types/analyze';

// ===== 라벨/키 매핑 (UI에서 한글 라벨 ↔ 내부 키 일관성)
export const GRANULARITY_LABELS: Record<'hourly'|'daily'|'weekly'|'monthly', FeedbackPeriod> = {
  hourly:  '시간별 보기',
  daily:   '일별 보기',
  weekly:  '주별 보기',
  monthly: '월별 보기',
};
export const periodOptions: FeedbackPeriod[] = [
  GRANULARITY_LABELS.hourly,
  GRANULARITY_LABELS.daily,
  GRANULARITY_LABELS.weekly,
  GRANULARITY_LABELS.monthly,
];

// ===== 시드 고정 난수 (더미 값이 랜덤이되 렌더마다 바뀌지 않도록)
function createSeededRng(seed = 20250810) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
const rnd   = createSeededRng();

// [ADD] 날짜를 로컬 타임존 기준 YYYY-MM-DD로 안전하게 포맷
function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// [ADD] 범위 방어: start > end면 스왑
function normalizeDateRange(startDate: string, endDate: string): [Date, Date] {
  const s = new Date(startDate);
  const e = new Date(endDate);
  return s <= e ? [s, e] : [e, s];
}

// ===== 연도별 월간 트렌드 
export const feedbackTrendData2025: FeedbackTrendData[] = [
  { month: 1, count: 5 }, { month: 2, count: 8 }, { month: 3, count: 12 },
  { month: 4, count: 7 }, { month: 5, count: 15 }, { month: 6, count: 22 },
  { month: 7, count: 18 }, { month: 8, count: 14 }, { month: 9, count: 20 },
  { month: 10, count: 16 }, { month: 11, count: 11 }, { month: 12, count: 19 },
];
export const feedbackTrendData2024: FeedbackTrendData[] = [
  { month: 1, count: 3 }, { month: 2, count: 6 }, { month: 3, count: 9 },
  { month: 4, count: 12 }, { month: 5, count: 18 }, { month: 6, count: 25 },
  { month: 7, count: 21 }, { month: 8, count: 16 }, { month: 9, count: 23 },
  { month: 10, count: 19 }, { month: 11, count: 14 }, { month: 12, count: 17 },
];
export const feedbackTrendData2023: FeedbackTrendData[] = [
  { month: 1, count: 2 }, { month: 2, count: 4 }, { month: 3, count: 7 },
  { month: 4, count: 10 }, { month: 5, count: 14 }, { month: 6, count: 18 },
  { month: 7, count: 15 }, { month: 8, count: 12 }, { month: 9, count: 16 },
  { month: 10, count: 13 }, { month: 11, count: 9 }, { month: 12, count: 11 },
];
export const feedbackDataByYear: Record<number, FeedbackTrendData[]> = {
  2023: feedbackTrendData2023,
  2024: feedbackTrendData2024,
  2025: feedbackTrendData2025,
};
// [ADD] as const로 고정
export const availableYears = [2023, 2024, 2025] as const;

// ===== 일/주/시간 단위 더미
export const generateDailyData = (year: number, month: number): DailyFeedbackData[] => {
  const dim = new Date(year, month, 0).getDate(); // month는 1~12 가정
  const base = Math.floor(rnd() * 5) + 3; // 3~7
  return Array.from({ length: dim }, (_, i) => {
    const day = i + 1;
    const weekday = new Date(year, month - 1, day).getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const monthProgress = day / dim;
    let count = base + Math.floor(rnd() * 8);
    if (isWeekend) count = Math.max(1, count - 2);
    if (monthProgress > 0.8) count += Math.floor(rnd() * 3);
    return { day, count };
  });
};

export const generateWeeklyData = (year: number, month: number): WeeklyFeedbackData[] => {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0);
  const firstWeekStart = new Date(start);
  firstWeekStart.setDate(start.getDate() - start.getDay()); // Sun 기준
  const weeks: WeeklyFeedbackData[] = [];
  let idx = 1;
  for (let d = new Date(firstWeekStart); d <= end; d.setDate(d.getDate() + 7)) {
    const weekStart = new Date(d);
    const weekEnd = new Date(d); weekEnd.setDate(weekEnd.getDate() + 6);
    const overlap = (weekStart <= end && weekEnd >= start);
    if (overlap) {
      const base = Math.floor(rnd() * 20) + 30; // 30~49
      const count = base + Math.floor(rnd() * 30);
      weeks.push({ week: idx++, count });
    }
  }
  return weeks;
};

export const generateHourlyData = (year: number, month: number, day: number): HourlyFeedbackData[] => {
  const dow = new Date(year, month - 1, day).getDay();
  const isWeekend = dow === 0 || dow === 6;
  return Array.from({ length: 24 }, (_, hour) => {
    let count = 0;
    if (isWeekend) {
      count = (hour >= 10 && hour <= 22) ? Math.floor(rnd() * 8) + 2 : Math.floor(rnd() * 3);
    } else {
      if (hour >= 9 && hour <= 18) count = Math.floor(rnd() * 15) + 10;
      else if (hour >= 19 && hour <= 22) count = Math.floor(rnd() * 8) + 3;
      else count = Math.floor(rnd() * 3);
    }
    return { hour, count };
  });
};

// [ADD] 시간별 만족도 더미 생성기: 특정 날짜에 대해 0~23시의 만족/불만족을 생성
export const generateHourlySatisfactionData = (
  year: number,
  month: number,
  day: number
): Array<{ hour: number; sat: number; unsat: number }> => {
  const dow = new Date(year, month - 1, day).getDay();
  const isWeekend = dow === 0 || dow === 6;

  return Array.from({ length: 24 }, (_, hour) => {
    // 기존 generateHourlyData와 같은 시간대 패턴으로 total 구성
    let total = 0;
    if (isWeekend) {
      total = (hour >= 10 && hour <= 22) ? Math.floor(rnd() * 8) + 2 : Math.floor(rnd() * 3);
    } else {
      if (hour >= 9 && hour <= 18) total = Math.floor(rnd() * 15) + 10;
      else if (hour >= 19 && hour <= 22) total = Math.floor(rnd() * 8) + 3;
      else total = Math.floor(rnd() * 3);
    }

    // 만족 비율: 평일 0.75~0.85, 주말은 약간 상향
    const baseRatio = 0.75 + rnd() * 0.1;
    const ratio = isWeekend ? Math.min(baseRatio + 0.05, 0.9) : baseRatio;

    const sat = Math.floor(total * ratio);
    const unsat = total - sat;
    return { hour, sat, unsat };
  });
};

// 호환용 즉시 생성 샘플
export const dailyFeedbackData:  DailyFeedbackData[]  = generateDailyData(2025, 7);
export const weeklyFeedbackData: WeeklyFeedbackData[] = generateWeeklyData(2025, 7);
export const hourlyFeedbackData: HourlyFeedbackData[] = generateHourlyData(2025, 7, 15);

// ======== 피드백 유형(도넛) 더미/집계
export const generateDailyFeedbackTypeData = (startDate: string, endDate: string): DailyFeedbackTypeData[] => {
  // [ADD] 역순 입력 방어
  const [start, end] = normalizeDateRange(startDate, endDate);

  const rows: DailyFeedbackTypeData[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // [FIX] UTC 의존 제거: 로컬 기준 날짜 문자열 생성
    const dateStr = formatDateLocal(d);

    const dow = d.getDay(); const isWeekend = dow === 0 || dow === 6;
    const baseMin = 1, baseMax = 8, span = baseMax - baseMin;
    const k = isWeekend ? 0.3 : 1.0; // 주말 낮춤
    const w = {
      '오래된 정보': 1.2 + rnd() * 0.6,
      '질문 의도 파악 실패': 0.9 + rnd() * 0.4,
      '잘못된 답변': 0.7 + rnd() * 0.6,
      '정보 누락': 0.5 + rnd() * 0.4,
      '기타': 0.3 + rnd() * 0.4,
    } as const;
    rows.push({
      date: dateStr,
      feedbackTypes: {
        '오래된 정보': Math.floor((baseMin + rnd() * span) * w['오래된 정보'] * k),
        '질문 의도 파악 실패': Math.floor((baseMin + rnd() * span) * w['질문 의도 파악 실패'] * k),
        '잘못된 답변': Math.floor((baseMin + rnd() * span) * w['잘못된 답변'] * k),
        '정보 누락': Math.floor((baseMin + rnd() * span) * w['정보 누락'] * k),
        '기타': Math.floor((baseMin + rnd() * span) * w['기타'] * k),
      },
    });
  }
  return rows;
};

export const aggregateFeedbackTypeData = (startDate: string, endDate: string): FeedbackTypeData[] => {
  const daily = generateDailyFeedbackTypeData(startDate, endDate);
  const totals = { '오래된 정보': 0, '질문 의도 파악 실패': 0, '잘못된 답변': 0, '정보 누락': 0, '기타': 0 };
  daily.forEach(day => {
    (Object.keys(totals) as (keyof typeof totals)[]).forEach(k => {
      totals[k] += day.feedbackTypes[k];
    });
  });
  const sum = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(totals)
  .map(([type, count]) => ({
    name: type,             // [FIX] FeedbackTypeData에 맞춰 name 추가
    value: count,           // [FIX] count → value 변경
    percentage: Math.round((count / sum) * 100),
    color: '#000',
  })).sort((a, b) => b.value - a.value);
};

// ======== 키워드(막대) 10종 더미/집계
// 키워드 목록(10개)
export const KEYWORDS_10 = ['휴가','야근','사직서','회의','교육','복지','인사','출장','채용','보너스'] as const;
// [ADD] 키워드 이름 유니온 타입
type KeywordName = typeof KEYWORDS_10[number];

export const generateDailyKeywordData = (startDate: string, endDate: string): DailyKeywordData[] => {
  // [ADD] 역순 입력 방어
  const [start, end] = normalizeDateRange(startDate, endDate);

  const rows: DailyKeywordData[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // [FIX] 로컬 기준 날짜 포맷 사용
    const dateStr = formatDateLocal(d);

    const dow = d.getDay(); const isWeekend = dow === 0 || dow === 6;
    const baseMin = 2, baseMax = 12, span = baseMax - baseMin;
    const k = isWeekend ? 0.4 : 1.0; // 주말 낮춤

    // 키워드별 가중치: 업무성 키워드는 평일 우세, 개인성 키워드는 주말도 소폭 유지
    const weights: Record<KeywordName, number> = {
      휴가: 0.9 + rnd() * 0.5,
      야근: (isWeekend ? 0.2 + rnd() * 0.2 : 0.9 + rnd() * 0.4),
      사직서: 0.6 + rnd() * 0.8,
      회의: (isWeekend ? 0.2 + rnd() * 0.3 : 1.0 + rnd() * 0.4),
      교육: 0.7 + rnd() * 0.6,
      복지: 0.6 + rnd() * 0.7,
      인사: 0.5 + rnd() * 0.7,
      출장: (isWeekend ? 0.1 + rnd() * 0.2 : 0.8 + rnd() * 0.5),
      채용: 0.6 + rnd() * 0.8,
      보너스: 0.6 + rnd() * 0.6,
    };

    // [FIX] any 제거: 키워드별 정적 타입 맵
    const obj: Record<KeywordName, number> = {
      휴가: 0, 야근: 0, 사직서: 0, 회의: 0, 교육: 0,
      복지: 0, 인사: 0, 출장: 0, 채용: 0, 보너스: 0,
    };
    KEYWORDS_10.forEach(kv => {
      obj[kv] = Math.floor((baseMin + rnd() * span) * weights[kv] * k);
    });

    rows.push({ date: dateStr, keywords: obj });
  }
  return rows;
};

export const aggregateKeywordData = (startDate: string, endDate: string): KeywordData[] => {
  const daily = generateDailyKeywordData(startDate, endDate);

  // [FIX] any 제거: 합계도 정적 타입
  const totals: Record<KeywordName, number> = {
    휴가: 0, 야근: 0, 사직서: 0, 회의: 0, 교육: 0,
    복지: 0, 인사: 0, 출장: 0, 채용: 0, 보너스: 0,
  };

  daily.forEach(day => {
    KEYWORDS_10.forEach(k => { totals[k] += day.keywords[k] ?? 0; });
  });

  const sum = (Object.values(totals) as number[]).reduce((s, v) => s + v, 0) || 1;

  // 10개 전부 반환(막대그래프)
  return KEYWORDS_10.map(name => ({
      name,
      value: totals[name],
      percentage: Math.round((totals[name] / sum) * 100),
      color: '#000', // 실제 바 색상은 컴포넌트에서 매핑
  })).sort((a, b) => b.value - a.value);
};

// ======== 만족도(기존 유지)
export const generateDailySatisfactionData = (startDate: string, endDate: string): DailySatisfactionData[] => {
  // [ADD] 역순 입력 방어
  const [start, end] = normalizeDateRange(startDate, endDate);

  const rows: DailySatisfactionData[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // [FIX] 로컬 기준 날짜 포맷 사용
    const dateStr = formatDateLocal(d);

    const dow = d.getDay(); const isWeekend = dow === 0 || dow === 6;
    const baseRatio = 0.75 + rnd() * 0.1; // 75~85%
    const total = Math.floor(rnd() * 20 + 10); // 10~30
    const ratio = isWeekend ? Math.min(baseRatio + 0.1, 0.9) : baseRatio;
    const satisfied = Math.floor(total * ratio);
    const unsatisfied = total - satisfied;
    rows.push({ date: dateStr, satisfaction: { '만족': satisfied, '불만족': unsatisfied }});
  }
  return rows;
};

export const aggregateSatisfactionData = (startDate: string, endDate: string): SatisfactionData[] => {
  const daily = generateDailySatisfactionData(startDate, endDate);
  let sat = 0, unsat = 0;
  daily.forEach(d => { sat += d.satisfaction['만족']; unsat += d.satisfaction['불만족']; });
  const sum = sat + unsat || 1;
  return [
    { type: '만족',   value: sat,   percentage: Math.round((sat   / sum) * 100), color: '#A8D8EA' },
    { type: '불만족', value: unsat, percentage: Math.round((unsat / sum) * 100), color: '#FF9AA2' },
  ];
};