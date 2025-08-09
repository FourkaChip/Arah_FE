// src/constants/analyzeConfig.ts

/** 만족/불만족 색상 */
export const SATIS_COLOR = '#A8D8EA';
export const UNSAT_COLOR = '#FF9AA2';
export const TYPE_COLOR: Record<'만족' | '불만족', string> = {
  만족: SATIS_COLOR,
  불만족: UNSAT_COLOR,
};

/** 피드백 유형별 색상 */
export const FEEDBACK_TYPE_COLORS: Record<string, string> = {
  '오래된 정보': '#C8A8E9',
  '질문 의도 파악 실패': '#FFD3B6',
  '잘못된 답변': '#FFCCCC',
  '정보 누락': '#A8D8EA',
  '기타': '#B8E6B8',
};

/** 키워드 색상 (기본 팔레트 포함) */
export const KEYWORD_COLORS: Record<string, string> = {
  '휴가': '#B8E6B8',
  '야근': '#FF9AA2',
  '사직서': '#A8D8EA',
  '회의': '#C8A8E9',
  '교육': '#FFCCCC',
  '복지': '#FFD3B6',
  '인사': '#E0BBE4',
  '출장': '#99CCFF',
  '채용': '#9FE2BF',
  '보너스': '#FFDF91',
};
export const DEFAULT_KEYWORD_COLOR = '#D1F2A5';

/** 라벨 표시 최소 퍼센트 */
export const MIN_LABEL_PERCENT = 3;

/** 라벨 줄바꿈 설정 */
export const LABEL_WRAP_MAX_CHARS = 8;
export const LABEL_WRAP_MAX_LINES = 2;