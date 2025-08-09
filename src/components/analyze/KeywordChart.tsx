// src/components/analyze/KeyWordChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { DateRange } from '@/types/analyze';
import { aggregateKeywordData } from '@/constants/dummydata/DummyAnalyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import {
  KEYWORD_COLORS,
  DEFAULT_KEYWORD_COLOR,
} from '@/constants/analyzeConfig';
import './AnalyzeChart.scss';

type KeywordDatum = {
  name: string;
  value: number;
  percentage: number;
};

const getKeywordColor = (name: string) => KEYWORD_COLORS[name] ?? DEFAULT_KEYWORD_COLOR;

const KeywordChart: React.FC = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  const keywordAgg: KeywordDatum[] = useMemo(() => {
    const res = aggregateKeywordData(dateRange.startDate, dateRange.endDate);
    return res.map(k => ({ name: k.name, value: k.value, percentage: k.percentage }));
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
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
            <Tooltip content={(props) => <CustomTooltip {...props} />} />
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

export default KeywordChart;