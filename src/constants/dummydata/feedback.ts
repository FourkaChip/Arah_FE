import { FeedbackTrendData, FeedbackPeriod, DailyFeedbackData, WeeklyFeedbackData, HourlyFeedbackData } from '@/types/analyze';

// 2025년 월별 피드백 데이터
export const feedbackTrendData2025: FeedbackTrendData[] = [
  { month: 1, count: 5 },
  { month: 2, count: 8 },
  { month: 3, count: 12 },
  { month: 4, count: 7 },
  { month: 5, count: 15 },
  { month: 6, count: 22 }, // 피크 포인트
  { month: 7, count: 18 },
  { month: 8, count: 14 },
  { month: 9, count: 20 },
  { month: 10, count: 16 },
  { month: 11, count: 11 },
  { month: 12, count: 19 }
];

// 2024년 월별 피드백 데이터
export const feedbackTrendData2024: FeedbackTrendData[] = [
  { month: 1, count: 3 },
  { month: 2, count: 6 },
  { month: 3, count: 9 },
  { month: 4, count: 12 },
  { month: 5, count: 18 },
  { month: 6, count: 25 },
  { month: 7, count: 21 },
  { month: 8, count: 16 },
  { month: 9, count: 23 },
  { month: 10, count: 19 },
  { month: 11, count: 14 },
  { month: 12, count: 17 }
];

// 2023년 월별 피드백 데이터
export const feedbackTrendData2023: FeedbackTrendData[] = [
  { month: 1, count: 2 },
  { month: 2, count: 4 },
  { month: 3, count: 7 },
  { month: 4, count: 10 },
  { month: 5, count: 14 },
  { month: 6, count: 18 },
  { month: 7, count: 15 },
  { month: 8, count: 12 },
  { month: 9, count: 16 },
  { month: 10, count: 13 },
  { month: 11, count: 9 },
  { month: 12, count: 11 }
];

// 월별 일별 데이터 생성 함수
export const generateDailyData = (year: number, month: number): DailyFeedbackData[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const baseValue = Math.floor(Math.random() * 5) + 3; // 3-7 기준값
  
  return Array.from({length: daysInMonth}, (_, i) => {
    const day = i + 1;
    // 주말에는 조금 더 적은 피드백, 월말/월초에는 변동
    const weekday = new Date(year, month - 1, day).getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const monthProgress = day / daysInMonth;
    
    let count = baseValue + Math.floor(Math.random() * 8); // 기본 변동
    if (isWeekend) count = Math.max(1, count - 2); // 주말 감소
    if (monthProgress > 0.8) count += Math.floor(Math.random() * 3); // 월말 증가
    
    return { day, count };
  });
};

// 월별 주별 데이터 생성 함수
export const generateWeeklyData = (year: number, month: number): WeeklyFeedbackData[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeksInMonth = Math.ceil(daysInMonth / 7);
  const baseValue = Math.floor(Math.random() * 20) + 30; // 30-49 기준값
  
  return Array.from({length: weeksInMonth}, (_, i) => {
    const week = i + 1;
    const count = baseValue + Math.floor(Math.random() * 30); // 변동폭 확대
    return { week, count };
  });
};

// 날짜별 시간별 데이터 생성 함수
export const generateHourlyData = (year: number, month: number, day: number): HourlyFeedbackData[] => {
  const isWeekend = new Date(year, month - 1, day).getDay() === 0 || new Date(year, month - 1, day).getDay() === 6;
  
  return Array.from({length: 24}, (_, hour) => {
    let count = 0;
    
    if (isWeekend) {
      // 주말 패턴: 늦은 아침부터 저녁까지 고른 분포
      if (hour >= 10 && hour <= 22) {
        count = Math.floor(Math.random() * 8) + 2;
      } else {
        count = Math.floor(Math.random() * 3);
      }
    } else {
      // 평일 패턴: 업무시간대 집중
      if (hour >= 9 && hour <= 18) {
        count = Math.floor(Math.random() * 15) + 10; // 업무시간 고점
      } else if (hour >= 19 && hour <= 22) {
        count = Math.floor(Math.random() * 8) + 3; // 저녁시간 중간
      } else {
        count = Math.floor(Math.random() * 3); // 새벽/밤 저점
      }
    }
    
    return { hour, count };
  });
};

// 기존 정적 데이터 (호환성 유지)
export const dailyFeedbackData: DailyFeedbackData[] = generateDailyData(2025, 7);
export const weeklyFeedbackData: WeeklyFeedbackData[] = generateWeeklyData(2025, 7);
export const hourlyFeedbackData: HourlyFeedbackData[] = generateHourlyData(2025, 7, 15);

// 연도별 데이터 맵 (확장)
export const feedbackDataByYear: Record<number, FeedbackTrendData[]> = {
  2023: feedbackTrendData2023,
  2024: feedbackTrendData2024,
  2025: feedbackTrendData2025
};

// 사용 가능한 연도 목록 (확장)
export const availableYears = [2023, 2024, 2025];

// 기간 선택 옵션
export const periodOptions: FeedbackPeriod[] = ['시간별 보기', '주별 보기', '일별 보기', '월별 보기']; 