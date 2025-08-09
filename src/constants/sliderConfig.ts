// 슬라이더 관련 상수 정의
export const SLIDER_CONFIG = {
  MIN_VALUE: 0,
  MAX_VALUE: 10,
  DEFAULT_VALUE: 5,
  STEP: 1,
  SELECTABLE_MIN: 1, // 실제 선택 가능한 최소값
} as const;

// 색상 상수
export const COLORS = {
  PRIMARY: '#2E3A8C',
  SECONDARY: '#232D64',
  TEXT_GRAY: '#666',
  TEXT_LIGHT_GRAY: '#888',
  BORDER_LIGHT: '#e1e8ed',
  WHITE: '#fff',
  RAIL_GRAY: '#d3d3d3',
  SHADOW: '#ABABAB',
} as const;

// 스타일 상수
export const STYLES = {
  BORDER_RADIUS: '12px',
  BOX_SHADOW: '0px 6px 10px 0px',
  TRANSITION: '0.2s ease',
} as const;

// 텍스트 상수
export const SLIDER_TEXTS = {
  USAGE_TIP: '사용 팁',
  SIMILARITY: {
    LABEL: '발화 유사도 설정',
    LEFT_LABEL: '포괄적 대응',
    RIGHT_LABEL: '정확한 대응',
    TIPS: [
      '느슨한 매칭이 필요할 땐 기준을 낮춰서 다양한 표현을 포용하세요.',
      '정밀한 매칭이 필요할 땐 기준을 높여서 정확한 응답을 이끌어낼 수 있어요.'
    ]
  },
  STYLE: {
    LABEL: '사고 스타일 설정',
    LEFT_LABEL: '형식적 사고',
    RIGHT_LABEL: '창의적 사고',
    TIPS: [
      '사무적인 답변이 필요할 땐 기준을 낮춰서 형식적으로 대화할 수 있어요.',
      '다양한 관점의 답변을 원한다면 기준을 높여서 창의적으로 대화할 수 있어요.'
    ]
  }
} as const;
