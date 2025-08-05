'use client';

import React, { useState, useMemo} from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRange } from '@/types/analyze';
import { aggregateKeywordData } from '@/constants/dummydata/keywords';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';  
import './AnalyzeChart.scss';

const KeywordDonutChart: React.FC = () => {
  // 키워드별 고정 색상 매핑
  const getKeywordColor = (keywordName: string): string => {
    const keywordColors: Record<string, string> = {
      '휴가': '#B8E6B8',      // 연한 초록
      '야근': '#FF9AA2',      // 연한 빨강
      '사직서': '#A8D8EA',    // 연한 파랑
      '회의': '#C8A8E9',      // 연한 보라
      '교육': '#FFCCCC'       // 연한 핑크
    };
    
    return keywordColors[keywordName] || '#D1F2A5'; // 기본 색상
  };

  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);


  const keywordData = useMemo(() => {
  return aggregateKeywordData(dateRange.startDate, dateRange.endDate);
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

  // 커스텀 툴팁 - 키워드명과 퍼센트 표시
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p>{`${data.name}: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };





  return (
    <div className={`box chartContainer`}>
      <div className="chartHeader">
        <h3 className="chartTitle">인기 키워드</h3>
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
          <PieChart>
            <Pie
              data={keywordData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {keywordData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getKeywordColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        {keywordData.map((item, index) => (
          <div key={index} className="legendItem">
            <div 
              className="legendColor" 
              style={{ backgroundColor: getKeywordColor(item.name) }}
            ></div>
            <span className="legendText">{item.name} {item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordDonutChart; 