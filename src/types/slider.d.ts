// 슬라이더 컴포넌트 Props 타입
export interface ChatbotSliderProps {
  value: number;
  onChange: (value: number) => void;
  onChangeComplete: (value: number) => void;
  label: string;
  leftLabel: string;
  rightLabel: string;
  tips: readonly string[];
  originalValue: number;
}

// 슬라이더 설정 타입
export interface SliderSettings {
  similarity: number;
  style: number;
}

// 마크 스타일 타입
export type MarkStyleType = 'default-value' | 'current-value' | 'zero-value';

// 슬라이더 구성 타입
export interface SliderConfig {
  readonly MIN_VALUE: number;
  readonly MAX_VALUE: number;
  readonly DEFAULT_VALUE: number;
  readonly STEP: number;
  readonly SELECTABLE_MIN: number;
}
