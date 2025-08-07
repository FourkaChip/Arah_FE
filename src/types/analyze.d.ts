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

// 커스텀 드롭다운 옵션 타입
export interface OptionType {
  value: string;
  label: string;
}

//기간 선택 드롭다운 컴포넌트의 props 타입
export interface CustomDropDownForPeriodProps {
  value: string;
  onChange: (value: string) => void;
}

// 날짜별 만족도 데이터 타입
export interface DailySatisfactionData {
  date: string; // YYYY-MM-DD 형식
  satisfaction: {
    만족: number;
    불만족: number;
  };
}

// 날짜별 피드백 유형 데이터 타입
export interface DailyFeedbackTypeData {
  date: string; // YYYY-MM-DD 형식
  feedbackTypes: {
    '오래된 정보': number;
    '질문 의도 파악 실패': number;
    '잘못된 답변': number;
    '정보 누락': number;
    '기타': number;
  };
}

// 날짜별 키워드 데이터 타입
export interface DailyKeywordData {
  date: string; // YYYY-MM-DD 형식
  keywords: {
    휴가: number;
    야근: number;
    사직서: number;
    회의: number;
    교육: number;
  };
}