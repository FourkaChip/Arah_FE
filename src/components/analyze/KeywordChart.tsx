// src/components/analyze/KeyWordChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { DateRange } from '@/types/analyze';
import { fetchTopKeywords, fetchCompanyCreatedAt } from '@/api/admin/analyze/analyzeFetch';
import {
  DEFAULT_KEYWORD_COLOR,
} from '@/constants/analyzeConfig';
import './AnalyzeChart.scss';

type KeywordDatum = {
  name: string;
  value: number;
  percentage: number;
};

type KeywordApiResponse = {
  keyword: string;
  count: number;
};

// 순위별 색상 배열 (1위부터 10위까지)
const RANK_COLORS = [
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

const getKeywordColor = (index: number) => RANK_COLORS[index] ?? DEFAULT_KEYWORD_COLOR;

const KeywordChart: React.FC = () => {
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

  const CustomTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const valNum = Number(payload[0]?.value ?? 0);
      return (
        <div className="tooltip">
          <p>{`${label}: ${valNum}건`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="box chartContainer">
      <div className="chartHeader">
        <h3 className="chartTitle">인기 키워드 TOP 10</h3>
        <div className="date-search-section">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="date-picker"
            min={companyCreatedAt || undefined}
            max={new Date().toISOString().split('T')[0]}
          />
          <span>~</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="date-picker"
            min={dateRange.startDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="chartWrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            로딩 중...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'red' }}>
            {error}
          </div>
        ) : keywordData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywordData} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#666' }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
              <Tooltip content={(props) => <CustomTooltip {...props} />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {keywordData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={getKeywordColor(idx)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && !error && keywordData.length > 0 && (
        <div className="legend">
          {keywordData.map((item, index) => (
            <div key={index} className="legendItem">
              <div className="legendColor" style={{ backgroundColor: getKeywordColor(index) }} />
              <span className="legendText">
                {item.name} {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeywordChart;