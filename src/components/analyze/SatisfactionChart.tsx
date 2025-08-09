// src/components/analyze/SatisfactionChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRange } from '@/types/analyze';
import { aggregateSatisfactionData } from '@/constants/dummydata/DummyAnalyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import {
  TYPE_COLOR,
  MIN_LABEL_PERCENT,
} from '@/constants/analyzeConfig';
import './AnalyzeChart.scss';

const SatisfactionChart: React.FC = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  const satisfactionData = useMemo(
    () => aggregateSatisfactionData(dateRange.startDate, dateRange.endDate),
    [dateRange.startDate, dateRange.endDate]
  );

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabelWithLeader = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    const ratio = percent * 100;
    if (ratio < MIN_LABEL_PERCENT) return null;

    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);

    const startR = outerRadius + 6;
    const midR = outerRadius + 22;
    const endOffset = 24;

    const sx = cx + startR * cos;
    const sy = cy + startR * sin;
    const mx = cx + midR * cos;
    const my = cy + midR * sin;
    const ex = mx + (cos >= 0 ? endOffset : -endOffset);
    const ey = my;

    const textAnchor = cos >= 0 ? 'start' : 'end';
    const labelText = `${payload.type} ${Math.round(ratio)}%`;
    const color = TYPE_COLOR[payload.type as '만족' | '불만족'] || '#888';

    return (
      <g>
        <path d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`} stroke={color} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={color} />
        <text
          x={ex + (cos >= 0 ? 4 : -4)}
          y={ey}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fill="#333"
          fontSize={12}
          style={{ pointerEvents: 'none' }}
        >
          {labelText}
        </text>
      </g>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p>{`${data.type}: ${data.percentage}% (${data.value}건)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="box chartContainer">
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
              labelLine={false}
              label={renderLabelWithLeader}
              isAnimationActive={false}
            >
              {satisfactionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TYPE_COLOR[entry.type as '만족' | '불만족'] || '#888'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SatisfactionChart;