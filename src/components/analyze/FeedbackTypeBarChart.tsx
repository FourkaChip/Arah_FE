'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import { DateRange } from '@/types/analyze';
import { aggregateFeedbackTypeData } from '@/constants/dummydata/feedbackTypes';
import './AnalyzeChart.scss';

const FeedbackTypeBarChart: React.FC = () => {
  // 파스텔 톤 색상 배열 - 이미지와 유사한 부드러운 색상
  const COLORS = ['#FFB3C6', '#A8D8EA', '#C8A8E9', '#FFCC9C', '#F5E6A3'];

  // 초기값을 고정값으로 설정
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });

  // 클라이언트에서만 현재 날짜 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDateRange({
        startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD')
      });
    }
  }, []);

  // 선택한 기간에 따른 피드백 유형 데이터 계산
  const feedbackTypeData = useMemo(() => {
    return aggregateFeedbackTypeData(dateRange.startDate, dateRange.endDate);
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip">
          <p>{`${label}: ${payload[0].value}건`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`box chartContainer`}>
      <div className="chartHeader">
        <h3 className="chartTitle">피드백 유형</h3>
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
          <BarChart
            data={feedbackTypeData}
            margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="type"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {feedbackTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        {feedbackTypeData.map((item, index) => (
          <div key={index} className="legendItem">
            <div 
              className="legendColor" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span className="legendText">{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackTypeBarChart; 