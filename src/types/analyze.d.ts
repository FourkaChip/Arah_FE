// FourKa_FE/src/types/analyze.d.ts

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
export type PeriodFeedbackData =
  | FeedbackTrendData
  | DailyFeedbackData
  | WeeklyFeedbackData
  | HourlyFeedbackData;

// 피드백 추이 기간 타입
export type FeedbackPeriod = '시간별 보기' | '주별 보기' | '일별 보기' | '월별 보기';

// 피드백 유형 데이터 타입
export interface FeedbackTypeData {
  name: string;         // 예: '오래된 정보'
  value: number;        // 합계 수치
  percentage: number;   // 백분율(정수)
  color: string;        // 차트 색상
}

// [ADD] 키워드 이름 유니온 (10개 전부)
export type KeywordName =
  | '휴가'
  | '야근'
  | '사직서'
  | '회의'
  | '교육'
  | '복지'
  | '인사'
  | '출장'
  | '채용'
  | '보너스';

// [FIX] 키워드 데이터 타입: name/value/percentage로 통일 + KeywordName 사용
export interface KeywordData {
  name: KeywordName;    // 기존: type: string
  value: number;        // 기존: count: number
  percentage: number;   // [ADD]
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

// 기간 선택 드롭다운 컴포넌트의 props 타입
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

// [FIX] 날짜별 키워드 데이터 타입: 10개 키 전부 포함하도록 수정
export interface DailyKeywordData {
  date: string; // YYYY-MM-DD 형식
  keywords: Record<KeywordName, number>;
  // 기존: { 휴가; 야근; 사직서; 회의; 교육; } → 누락 키로 인해 인덱싱 오류 발생(ts7053)
}