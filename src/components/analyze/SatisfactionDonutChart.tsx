'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import { DateRange } from '@/types/analyze';
import { aggregateSatisfactionData } from '@/constants/dummydata/satisfaction';
import './AnalyzeChart.scss';

const SatisfactionDonutChart: React.FC = () => {
  const COLORS = ['#A8D8EA', '#FF9AA2'];

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

  // 선택한 기간에 따른 만족도 데이터 계산
  const satisfactionData = useMemo(() => {
    return aggregateSatisfactionData(dateRange.startDate, dateRange.endDate);
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 파이 조각 위 라벨 렌더링 함수
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (entry: any) => {
    return (
      <text
        x={entry.x}
        y={entry.y}
        dy={8}
        fill="#333" // 여기가 텍스트 색상!
        fontSize={14}
        textAnchor="middle"
      >
        {`${entry.percentage}%`}
      </text>
    );
  };

  // 커스텀 툴팁 - 만족도 타입과 퍼센트 표시
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p>{`${data.type}: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };



  return (
    <div className={`box chartContainer`}>
      <div className="chartHeader">
        <h3 className="chartTitle">만족도</h3>
        <div className="date-search-section">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="date-picker satisfaction"
          />
          <span>~</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="date-picker satisfaction"
            min={dateRange.startDate}
          />
        </div>
      </div>
      <div className="chartWrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={satisfactionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {satisfactionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        {satisfactionData.map((item, index) => (
          <div key={index} className="legendItem">
            <div 
              className="legendColor" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span className="legendText">{item.type} {item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SatisfactionDonutChart; 