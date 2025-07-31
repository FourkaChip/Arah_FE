import { KeywordData } from '@/types/analyze';

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

// 날짜별 키워드 데이터 생성 함수
export const generateDailyKeywordData = (startDate: string, endDate: string): DailyKeywordData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data: DailyKeywordData[] = [];

  // 날짜 범위만큼 반복
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 모든 키워드가 동등한 기회를 가지도록 기본 범위 설정
    const baseRange = { min: 3, max: 15 }; // 기본 3-15 범위
    const weekendMultiplier = isWeekend ? 0.4 : 1.0; // 주말 40% 수준
    
    // 각 키워드별로 개별적인 랜덤 가중치 적용
    const keywordWeights = {
      휴가: 0.8 + Math.random() * 0.4, // 0.8-1.2 가중치
      야근: isWeekend ? 0.1 + Math.random() * 0.2 : 0.7 + Math.random() * 0.6, // 평일에 더 높음
      사직서: 0.6 + Math.random() * 0.8, // 0.6-1.4 가중치  
      회의: isWeekend ? 0.2 + Math.random() * 0.3 : 0.9 + Math.random() * 0.4, // 평일에 더 높음
      교육: 0.7 + Math.random() * 0.6 // 0.7-1.3 가중치
    };
    
    data.push({
      date: dateStr,
      keywords: {
        휴가: Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * keywordWeights.휴가 * weekendMultiplier),
        야근: Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * keywordWeights.야근 * weekendMultiplier),
        사직서: Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * keywordWeights.사직서 * weekendMultiplier),
        회의: Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * keywordWeights.회의 * weekendMultiplier),
        교육: Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * keywordWeights.교육 * weekendMultiplier)
      }
    });
  }

  return data;
};

// 기간별 키워드 데이터 집계 함수
export const aggregateKeywordData = (startDate: string, endDate: string): KeywordData[] => {
  const dailyData = generateDailyKeywordData(startDate, endDate);
  
  // 키워드별 총합 계산
  const totals = {
    휴가: 0,
    야근: 0,  
    사직서: 0,
    회의: 0,
    교육: 0
  };

  dailyData.forEach(day => {
    Object.keys(totals).forEach(keyword => {
      totals[keyword as keyof typeof totals] += day.keywords[keyword as keyof typeof day.keywords];
    });
  });

  // 전체 합계 계산
  const totalSum = Object.values(totals).reduce((sum, count) => sum + count, 0);

  // KeywordData 형식으로 변환하고 정렬
  const keywordArray = Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSum > 0 ? Math.round((value / totalSum) * 100) : 0,
      color: '#000' // 색상은 차트에서 COLORS 배열로 덮어씀
    }))
    .sort((a, b) => b.value - a.value); // 값이 높은 순으로 정렬

  // 상위 5개 키워드 모두 반환
  const result = keywordArray.slice(0, 5);
  

  return result;
};
