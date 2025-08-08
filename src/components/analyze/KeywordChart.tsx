'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DateRange } from '@/types/analyze';
import { aggregateKeywordData } from '@/constants/dummydata/DummyAnalyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import './AnalyzeChart.scss';

// 키워드 10종 색상 매핑(라벨 고정형)
const KEYWORD_COLORS: Record<string, string> = {
  '휴가': '#B8E6B8',
  '야근': '#FF9AA2',
  '사직서': '#A8D8EA',
  '회의': '#C8A8E9',
  '교육': '#FFCCCC',
  '복지': '#FFD3B6',
  '인사': '#E0BBE4',
  '출장': '#99CCFF',
  '채용': '#9FE2BF',
  '보너스': '#FFDF91',
};
const getKeywordColor = (name: string) => KEYWORD_COLORS[name] ?? '#D1F2A5';

const KeywordBarChart: React.FC = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  // aggregateKeywordData는 이제 10개 반환(이름, value, percentage)
  const keywordAgg = useMemo(() => {
    const res = aggregateKeywordData(dateRange.startDate, dateRange.endDate);
    // 막대차트용 필드만 추림
    return res.map(k => ({ name: k.name, value: k.value, percentage: k.percentage }));
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const CustomTooltip = ({
    active, payload, label,
  }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const { value } = payload[0];
      return (
        <div className="tooltip">
          <p>{`${label}: ${value}건`}</p>
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
          />
          <span>~</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="date-picker"
            min={dateRange.startDate}
          />
        </div>
      </div>

      <div className="chartWrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={keywordAgg} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
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
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {keywordAgg.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={getKeywordColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="legend">
        {keywordAgg.map((item, index) => (
          <div key={index} className="legendItem">
            <div className="legendColor" style={{ backgroundColor: getKeywordColor(item.name) }} />
            <span className="legendText">
              {item.name} {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordBarChart;