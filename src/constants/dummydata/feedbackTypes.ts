import { FeedbackTypeData } from '@/types/analyze';

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

// 날짜별 피드백 유형 데이터 생성 함수
export const generateDailyFeedbackTypeData = (startDate: string, endDate: string): DailyFeedbackTypeData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data: DailyFeedbackTypeData[] = [];

  // 날짜 범위만큼 반복
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 기본 범위 설정
    const baseRange = { min: 1, max: 8 }; // 기본 1-8 범위
    const weekendMultiplier = isWeekend ? 0.3 : 1.0; // 주말 30% 수준
    
    // 각 피드백 유형별로 개별적인 랜덤 가중치 적용
    const typeWeights = {
      '오래된 정보': 1.2 + Math.random() * 0.6, // 가장 빈번한 피드백
      '질문 의도 파악 실패': 0.9 + Math.random() * 0.4,
      '잘못된 답변': 0.7 + Math.random() * 0.6,
      '정보 누락': 0.5 + Math.random() * 0.4,
      '기타': 0.3 + Math.random() * 0.4 // 가장 적은 피드백
    };
    
    data.push({
      date: dateStr,
      feedbackTypes: {
        '오래된 정보': Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * typeWeights['오래된 정보'] * weekendMultiplier),
        '질문 의도 파악 실패': Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * typeWeights['질문 의도 파악 실패'] * weekendMultiplier),
        '잘못된 답변': Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * typeWeights['잘못된 답변'] * weekendMultiplier),
        '정보 누락': Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * typeWeights['정보 누락'] * weekendMultiplier),
        '기타': Math.floor((baseRange.min + Math.random() * (baseRange.max - baseRange.min)) * typeWeights['기타'] * weekendMultiplier)
      }
    });
  }

  return data;
};

// 기간별 피드백 유형 데이터 집계 함수
export const aggregateFeedbackTypeData = (startDate: string, endDate: string): FeedbackTypeData[] => {
  const dailyData = generateDailyFeedbackTypeData(startDate, endDate);
  
  // 피드백 유형별 총합 계산
  const totals = {
    '오래된 정보': 0,
    '질문 의도 파악 실패': 0,
    '잘못된 답변': 0,
    '정보 누락': 0,
    '기타': 0
  };

  dailyData.forEach(day => {
    Object.keys(totals).forEach(type => {
      totals[type as keyof typeof totals] += day.feedbackTypes[type as keyof typeof day.feedbackTypes];
    });
  });

  // FeedbackTypeData 형식으로 변환하고 정렬
  const feedbackTypeArray = Object.entries(totals)
    .map(([type, count]) => ({
      type,
      count,
      color: '#000' // 색상은 차트에서 COLORS 배열로 덮어씀
    }))
    .sort((a, b) => b.count - a.count); // 값이 높은 순으로 정렬

  // 디버깅용 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('피드백 유형 집계 결과:', feedbackTypeArray.map(f => `${f.type}: ${f.count}`));
  }

  return feedbackTypeArray;
};

// 기존 정적 데이터 (호환성 유지)
export const feedbackTypeData: FeedbackTypeData[] = [
  {
    type: '오래된 정보',
    count: 15,
    color: '#FF6B6B'
  },
  {
    type: '질문 의도 파악 실패',
    count: 12,
    color: '#4ECDC4'
  },
  {
    type: '잘못된 답변',
    count: 8,
    color: '#45B7D1'
  },
  {
    type: '정보 누락',
    count: 6,
    color: '#96CEB4'
  },
  {
    type: '기타',
    count: 4,
    color: '#FECA57'
  }
]; 