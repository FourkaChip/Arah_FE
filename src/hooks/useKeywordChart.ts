// src/hooks/useKeywordChart.ts

import { useState, useEffect } from 'react';
import { DateRange } from '@/types/analyze';
import { KeywordDatum, KeywordApiResponse } from '@/types/keyword';
import { fetchTopKeywords, fetchCompanyCreatedAt } from '@/api/admin/analyze/analyzeFetch';

export const useKeywordChart = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [keywordData, setKeywordData] = useState<KeywordDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyCreatedAt, setCompanyCreatedAt] = useState<string>('');
  const [isDateRangeInitialized, setIsDateRangeInitialized] = useState(false);

  // 회사 가입일 조회 및 기본 날짜 범위 설정
  useEffect(() => {
    if (isDateRangeInitialized) return;
    
    const initializeDateRange = async () => {
      try {
        const createdAt = await fetchCompanyCreatedAt();
        setCompanyCreatedAt(createdAt);
        
        // 기본 날짜 범위 설정
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        
        // 가입일이 한 달 전보다 늦으면 가입일을 시작일로 설정
        const startDate = createdAt > oneMonthAgoStr ? createdAt : oneMonthAgoStr;
        
        setDateRange({
          startDate,
          endDate: todayStr,
        });
        
        setIsDateRangeInitialized(true);
      } catch (err) {
        console.error('회사 가입일 조회 실패:', err);
        
        // 가입일 조회 실패 시 기본 한 달 범위로 설정
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        setDateRange({
          startDate: oneMonthAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        });
        
        setIsDateRangeInitialized(true);
      }
    };

    initializeDateRange();
  }, [isDateRangeInitialized]);

  // API에서 데이터 가져오기
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
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
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => {
      const next = { ...prev, [field]: value };
      
      // 시작일이 가입일보다 빠르면 가입일로 설정
      if (field === 'startDate' && companyCreatedAt && value < companyCreatedAt) {
        next.startDate = companyCreatedAt;
      }
      
      // 시작일이 종료일보다 늦으면 종료일을 시작일로 설정
      if (field === 'startDate' && next.endDate && next.startDate > next.endDate) {
        next.endDate = next.startDate;
      }
      
      return next;
    });
  };

  return {
    dateRange,
    keywordData,
    loading,
    error,
    companyCreatedAt,
    handleDateChange,
  };
};
