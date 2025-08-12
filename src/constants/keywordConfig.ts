// src/constants/keywordConfig.ts

import { DEFAULT_KEYWORD_COLOR } from '@/constants/analyzeConfig';

// 순위별 색상 배열 (1위부터 10위까지)
export const RANK_COLORS = [
  '#B8E6B8', // 1위
  '#FF9AA2', // 2위
  '#A8D8EA', // 3위
  '#C8A8E9', // 4위
  '#FFCCCC', // 5위
  '#FFD3B6', // 6위
  '#E0BBE4', // 7위
  '#99CCFF', // 8위
  '#9FE2BF', // 9위
  '#FFDF91', // 10위
];

// 순위별 색상 가져오기 함수
export const getKeywordColor = (index: number): string => 
  RANK_COLORS[index] ?? DEFAULT_KEYWORD_COLOR;

// 키워드 차트 설정
export const KEYWORD_CHART_CONFIG = {
  height: 300,
  margin: { top: 20, right: 20, left: 20, bottom: 60 },
  maxBarSize: 60,
  barCategoryGap: '20%',
  xAxisConfig: {
    fontSize: 11,
    fill: '#666',
    angle: -30,
    height: 60,
  },
  yAxisConfig: {
    fontSize: 12,
    fill: '#666',
  },
  gridConfig: {
    strokeDasharray: '3 3',
    stroke: '#f0f0f0',
  },
  barConfig: {
    radius: [4, 4, 0, 0] as [number, number, number, number],
  },
} as const;
