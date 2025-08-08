// FourKa_FE/src/components/analyze/FeedbackTypeDonutChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRange, FeedbackTypeData } from '@/types/analyze';
import { aggregateFeedbackTypeData } from '@/constants/dummydata/DummyAnalyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import './AnalyzeChart.scss';

const TYPE_COLORS: Record<string, string> = {
  '오래된 정보': '#C8A8E9',
  '질문 의도 파악 실패': '#FFD3B6',
  '잘못된 답변': '#FFCCCC',
  '정보 누락': '#A8D8EA',
  '기타': '#B8E6B8',
};

const getTypeColor = (type: string) => TYPE_COLORS[type] ?? '#999';

const FeedbackTypeDonutChart: React.FC = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  // [FIX] FeedbackTypeData는 name/value/percentage를 사용
  type DonutDatum = { name: string; value: number; percentage: number };

  const donutData: DonutDatum[] = useMemo(() => {
    const raw: FeedbackTypeData[] = aggregateFeedbackTypeData(
      dateRange.startDate,
      dateRange.endDate
    );

    // [FIX] total 계산도 value로
    const total = raw.reduce((acc, cur) => acc + (cur.value ?? 0), 0) || 1;

    return raw.map((d) => ({
      name: d.name, // [FIX] d.type → d.name
      value: d.value, // [FIX] d.count → d.value
      // [KEEP] 집계에서 percentage 제공하지 않는 경우 대비
      percentage:
        typeof d.percentage === 'number'
          ? d.percentage
          : Math.round(((d.value ?? 0) / total) * 100),
    }));
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (entry: any) => (
    <text x={entry.x} y={entry.y} dy={8} fill="#333" fontSize={14} textAnchor="middle">
      {`${entry.percentage}%`}
    </text>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p>{`${data.name}: ${data.percentage}% (${data.value}건)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="box chartContainer">
      <div className="chartHeader">
        <h3 className="chartTitle">피드백 유형 분포</h3>
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
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {donutData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={getTypeColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="legend">
        {donutData.map((item, idx) => (
          <div key={idx} className="legendItem">
            <div className="legendColor" style={{ backgroundColor: getTypeColor(item.name) }} />
            <span className="legendText">
              {item.name} {item.percentage}% ({item.value}건)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackTypeDonutChart;