// src/types/keyword.d.ts

export interface KeywordDatum {
  name: string;
  value: number;
  percentage: number;
}

export interface KeywordApiResponse {
  keyword: string;
  count: number;
}
