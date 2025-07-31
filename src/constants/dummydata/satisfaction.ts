import { SatisfactionData } from '@/types/analyze';

// 날짜별 만족도 데이터 타입
export interface DailySatisfactionData {
  date: string; // YYYY-MM-DD 형식
  satisfaction: {
    만족: number;
    불만족: number;
  };
}

// 날짜별 만족도 데이터 생성 함수
export const generateDailySatisfactionData = (startDate: string, endDate: string): DailySatisfactionData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data: DailySatisfactionData[] = [];

  // 날짜 범위만큼 반복
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 기본적으로 만족도가 높게 설정 (70-80% 만족)
    const baseSatisfactionRatio = 0.75 + (Math.random() * 0.1); // 75-85%
    const totalFeedback = Math.floor(Math.random() * 20 + 10); // 10-30개 피드백
    
    // 주말에는 약간 만족도가 높음 (여유로워서)
    const satisfactionRatio = isWeekend ? Math.min(baseSatisfactionRatio + 0.1, 0.9) : baseSatisfactionRatio;
    
    const satisfiedCount = Math.floor(totalFeedback * satisfactionRatio);
    const unsatisfiedCount = totalFeedback - satisfiedCount;
    
    data.push({
      date: dateStr,
      satisfaction: {
        만족: satisfiedCount,
        불만족: unsatisfiedCount
      }
    });
  }

  return data;
};

// 기간별 만족도 데이터 집계 함수
export const aggregateSatisfactionData = (startDate: string, endDate: string): SatisfactionData[] => {
  const dailyData = generateDailySatisfactionData(startDate, endDate);
  
  // 만족도별 총합 계산
  let totalSatisfied = 0;
  let totalUnsatisfied = 0;

  dailyData.forEach(day => {
    totalSatisfied += day.satisfaction.만족;
    totalUnsatisfied += day.satisfaction.불만족;
  });

  const totalSum = totalSatisfied + totalUnsatisfied;
  
  const satisfactionArray: SatisfactionData[] = [
    {
      type: '만족',
      value: totalSatisfied,
      percentage: totalSum > 0 ? Math.round((totalSatisfied / totalSum) * 100) : 0,
      color: '#10B981' // 실제로는 차트에서 COLORS 배열로 덮어씀
    },
    {
      type: '불만족',
      value: totalUnsatisfied,
      percentage: totalSum > 0 ? Math.round((totalUnsatisfied / totalSum) * 100) : 0,
      color: '#374151'
    }
  ];

  return satisfactionArray;
};

// 기존 정적 데이터 (호환성 유지)
export const satisfactionData: SatisfactionData[] = [
  {
    type: '만족',
    value: 76,
    percentage: 76,
    color: '#10B981'
  },
  {
    type: '불만족',
    value: 24,
    percentage: 24,
    color: '#374151'
  }
]; 