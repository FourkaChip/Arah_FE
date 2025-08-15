// src/constants/apiUtils.ts
import type { 
  SatisfactionRaw, 
  SatisfactionApiResult,
  FeedbackReasonRaw,
  FeedbackReasonApiResponse,
  FeedbackReason
} from '@/types/analyze';

// 피드백 사유 한글 매핑
export const FEEDBACK_REASON_MAPPING: Record<FeedbackReason, string> = {
  MISSING_INFO: '정보 누락',
  OTHER: '기타',
  OUTDATED_INFO: '오래된 정보',
  WRONG_ANSWER: '잘못된 답변',
  INTENT_FAILURE: '질문 의도 파악 실패',
};

export function convertFeedbackReasonResultToRows(result: FeedbackReasonApiResponse[]): FeedbackReasonRaw[] {
  if (!result || result.length === 0) {
    // 데이터가 없는 경우 빈 배열 반환
    return [];
  }

  // API 데이터를 변환하여 값이 있는 것만 포함
  const convertedData = result
    .filter(item => item.count > 0) // 0보다 큰 값만 필터링
    .map(item => ({
      name: FEEDBACK_REASON_MAPPING[item.feedback_reason] || item.feedback_reason,
      value: item.count,
      percentage: Math.round(item.percentage),
    }));

  return convertedData;
}

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
