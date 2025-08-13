'use client';

import { useState, useEffect, useRef } from 'react';
import { DateRange } from '@/types/analyze';
import { fetchCompanyCreatedAt } from '@/api/admin/analyze/analyzeFetch';

interface UseDefaultDateRangeReturn {
  dateRange: DateRange;
  companyCreatedAt: string;
  loading: boolean;
  error: string | null;
  handleDateChange: (field: keyof DateRange, value: string) => void;
}

const useDefaultDateRange = (): UseDefaultDateRangeReturn => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [companyCreatedAt, setCompanyCreatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  // 회사 가입일 조회 및 기본 날짜 범위 설정
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeDateRange = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const createdAt = await fetchCompanyCreatedAt();
        setCompanyCreatedAt(createdAt);
        
        // 기본 날짜 범위 설정 (한 달 전 ~ 오늘)
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
        
        isInitialized.current = true;
      } catch {
        setError('가입일 조회에 실패했습니다.');

        // 가입일 조회 실패 시 기본 한 달 범위로 설정
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        setDateRange({
          startDate: oneMonthAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        });
        
        isInitialized.current = true;
      } finally {
        setLoading(false);
      }
    };

    initializeDateRange();
  }, []);

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
    companyCreatedAt,
    loading,
    error,
    handleDateChange,
  };
};

export default useDefaultDateRange;
