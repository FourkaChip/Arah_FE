// src/constants/apiUtils.ts
import type { 
  SatisfactionRaw, 
  SatisfactionApiResult 
} from '@/types/analyze';

export function convertSatisfactionResultToRows(result: SatisfactionApiResult): SatisfactionRaw[] {
  return [
    { type: '만족', value: result.like_count, percentage: result.like_ratio },
    { type: '불만족', value: result.unlike_count, percentage: result.unlike_ratio },
  ];
}
