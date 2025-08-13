//src/components/analyze/SatisfactionChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import type { SatisfactionRaw } from '@/types/analyze';
import { TYPE_COLOR } from '@/constants/analyzeConfig';
import { fetchSatisfactionRaw } from '@/api/admin/analyze/analyzeFetch';
import { convertSatisfactionResultToRows } from '@/utils/apiUtils';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import ChartHeader from '@/components/common/ChartHeader';
import DonutChart from '@/components/common/DonutChart';
import './AnalyzeChart.scss';

type Props = Record<string, never>;

const EMPTY_ROWS: SatisfactionRaw[] = [
  { type: '만족', value: 0, percentage: 50 },
  { type: '불만족', value: 0, percentage: 50 },
];

const SatisfactionChart: React.FC<Props> = () => {
  const [data, setData] = useState<SatisfactionRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    dateRange,
    companyCreatedAt,
    loading: dateRangeLoading,
    error: dateRangeError,
    handleDateChange,
  } = useDefaultDateRange();

  // 회사 가입일 조회 및 기본 날짜 범위 설정
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate || dateRangeLoading) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    
    fetchSatisfactionRaw({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      signal: ac.signal,
    })
      .then(result => setData(convertSatisfactionResultToRows(result)))
      .catch(err => {
        if (err?.name !== 'AbortError') {
          setError(typeof err?.message === 'string' ? err.message : '요청 실패');
        }
      })
      .finally(() => setLoading(false));
      
    return () => ac.abort();
  }, [dateRange.startDate, dateRange.endDate, dateRangeLoading]);

  const getColor = (type: string) => TYPE_COLOR[type as '만족' | '불만족'] || '#888';

  if (error || dateRangeError) {
    return (
      <div className="box chartContainer">
        <ChartHeader title="만족도" dateRange={dateRange} onDateChange={handleDateChange} companyCreatedAt={companyCreatedAt} />
        <div className="chartWrapper">
          <DonutChart
            data={[]}
            getColor={getColor}
            error={error || dateRangeError}
          />
        </div>
      </div>
    );
  }

  const chartRows = data.length ? data : EMPTY_ROWS;

  const totalValue = chartRows.reduce((sum, row) => sum + row.value, 0);
  const visualChartRows = totalValue === 0 
    ? chartRows.map(row => ({ ...row, value: 1 }))
    : chartRows.map(row => ({
        ...row, 
        value: row.value === 0 ? 0.01 : row.value
      }));

  return (
    <div className="box chartContainer">
      <ChartHeader 
        title="만족도" 
        dateRange={dateRange} 
        onDateChange={handleDateChange} 
        companyCreatedAt={companyCreatedAt} 
      />

      <div className="chartWrapper">
        {loading || dateRangeLoading ? (
          <p>불러오는 중…</p>
        ) : (
          <DonutChart
            data={visualChartRows}
            getColor={getColor}
            loading={loading || dateRangeLoading}
            height={300}
          />
        )}
      </div>
    </div>
  );
};

export default SatisfactionChart;
