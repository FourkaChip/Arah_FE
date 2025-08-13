// src/hooks/useKeywordChart.ts

import { useState, useEffect } from 'react';
import { KeywordDatum, KeywordApiResponse } from '@/types/keyword';
import { fetchTopKeywords } from '@/api/admin/analyze/analyzeFetch';
import useDefaultDateRange from './useDefaultDateRange';

export const useKeywordChart = () => {
  const [keywordData, setKeywordData] = useState<KeywordDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    dateRange,
    companyCreatedAt,
    loading: dateRangeLoading,
    error: dateRangeError,
    handleDateChange,
  } = useDefaultDateRange();

  // API에서 데이터 가져오기
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate || dateRangeLoading) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data: KeywordApiResponse[] = await fetchTopKeywords({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        if (!data || data.length === 0) {
          setKeywordData([]);
        } else {
          // 전체 카운트 계산
          const totalCount = data.reduce((sum, item) => sum + item.count, 0);
          
          // 데이터 변환 (percentage 계산)
          const transformedData = data.map(item => ({
            name: item.keyword,
            value: item.count,
            percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
          }));
          
          setKeywordData(transformedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange.startDate, dateRange.endDate, dateRangeLoading]);

  return {
    dateRange,
    keywordData,
    loading: loading || dateRangeLoading,
    error: error || dateRangeError,
    companyCreatedAt,
    handleDateChange,
  };
};
