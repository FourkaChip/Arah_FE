// 피드백 추이 데이터 타입 (월간용)
export interface FeedbackTrendData {
  month: number;
  count: number;
}

// 일간 피드백 데이터 타입
export interface DailyFeedbackData {
  day: number;
  count: number;
}

// 주간 피드백 데이터 타입
export interface WeeklyFeedbackData {
  week: number;
  count: number;
}

// 시간별 피드백 데이터 타입
export interface HourlyFeedbackData {
  hour: number;
  count: number;
}

// 통합 피드백 데이터 타입
export type PeriodFeedbackData = FeedbackTrendData | DailyFeedbackData | WeeklyFeedbackData | HourlyFeedbackData;

// 피드백 추이 기간 타입
export type FeedbackPeriod = '시간별 보기' | '주별 보기' | '일별 보기' | '월별 보기';

// 키워드 데이터 타입
export interface KeywordData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// 피드백 유형 데이터 타입
export interface FeedbackTypeData {
  type: string;
  count: number;
  color: string;
}

// 만족도 데이터 타입
export interface SatisfactionData {
  type: '만족' | '불만족';
  value: number;
  percentage: number;
  color: string;
}

// 날짜 기간 선택 타입
export interface DateRange {
  startDate: string;
  endDate: string;
} 