// src/constants/apiUtils.ts
import type { 
  SatisfactionRaw, 
  SatisfactionApiResult 
} from '@/types/analyze';

export function convertSatisfactionResultToRows(result: SatisfactionApiResult): SatisfactionRaw[] {
  const { like_count, unlike_count } = result;
  const total = like_count + unlike_count;
  
  // 둘 다 0인 경우: 50%, 50%로 균등 분배
  if (total === 0) {
    return [
      { type: '만족', value: 0, percentage: 50 },
      { type: '불만족', value: 0, percentage: 50 },
    ];
  }
  
  // 하나는 0, 다른 하나는 0이 아닌 경우: 0%, 100% 또는 100%, 0%
  if (like_count === 0 && unlike_count > 0) {
    return [
      { type: '만족', value: 0, percentage: 0 },
      { type: '불만족', value: unlike_count, percentage: 100 },
    ];
  }
  
  if (unlike_count === 0 && like_count > 0) {
    return [
      { type: '만족', value: like_count, percentage: 100 },
      { type: '불만족', value: 0, percentage: 0 },
    ];
  }
  
  // 둘 다 0이 아닌 경우: 정상적인 비율 계산
  return [
    { 
      type: '만족', 
      value: like_count, 
      percentage: Math.round((like_count / total) * 100) 
    },
    { 
      type: '불만족', 
      value: unlike_count, 
      percentage: Math.round((unlike_count / total) * 100) 
    },
  ];
}
