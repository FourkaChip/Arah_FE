// src/components/analyze/FeedbackTypeChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { FeedbackReasonRaw } from '@/types/analyze';
import { fetchFeedbackReasonStats } from '@/api/admin/analyze/analyzeFetch';
import { convertFeedbackReasonResultToRows } from '@/utils/apiUtils';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import ChartHeader from '@/components/common/ChartHeader';
import DonutChart from '@/components/common/DonutChart';
import { FEEDBACK_TYPE_COLORS } from '@/constants/analyzeConfig';
import './AnalyzeChart.scss';

const FeedbackTypeChart: React.FC = () => {
  const [data, setData] = useState<FeedbackReasonRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    dateRange,
    companyCreatedAt,
    loading: dateRangeLoading,
    error: dateRangeError,
    handleDateChange,
  } = useDefaultDateRange();

  const getTypeColor = (type: string) => FEEDBACK_TYPE_COLORS[type] ?? '#888';

  // API에서 데이터 가져오기
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate || dateRangeLoading) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    
    fetchFeedbackReasonStats({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      signal: ac.signal,
    })
      .then(result => setData(convertFeedbackReasonResultToRows(result)))
      .catch(err => {
        if (err?.name !== 'AbortError') {
          setError(typeof err?.message === 'string' ? err.message : '요청 실패');
        }
      })
      .finally(() => setLoading(false));
      
    return () => ac.abort();
  }, [dateRange.startDate, dateRange.endDate, dateRangeLoading]);

  return (
    <div className="box chartContainer">
      <ChartHeader 
        title="피드백 유형" 
        dateRange={dateRange} 
        onDateChange={handleDateChange} 
        companyCreatedAt={companyCreatedAt} 
      />

      <div className="chartWrapper">
        <DonutChart
          data={data}
          getColor={getTypeColor}
          loading={loading || dateRangeLoading}
          error={error || dateRangeError}
          emptyMessage="선택한 기간에 해당하는 데이터가 없습니다."
          height={300}
          showWrappedLabels={true}
        />
      </div>
    </div>
  );
};

export default FeedbackTypeChart;
