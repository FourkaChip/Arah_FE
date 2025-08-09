// src/components/analyze/FeedbackTypeChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRange } from '@/types/analyze';
import { aggregateFeedbackTypeData } from '@/constants/dummydata/DummyAnalyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import {
  FEEDBACK_TYPE_COLORS,
  MIN_LABEL_PERCENT,
  LABEL_WRAP_MAX_CHARS,
  LABEL_WRAP_MAX_LINES,
} from '@/constants/analyzeConfig';
import './AnalyzeChart.scss';

const getTypeColor = (type: string) => FEEDBACK_TYPE_COLORS[type] ?? '#888';

const FeedbackTypeChart: React.FC = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  const donutData = useMemo(() => {
    const raw = aggregateFeedbackTypeData(dateRange.startDate, dateRange.endDate);
    const total = raw.reduce((acc, cur) => acc + (cur.value ?? 0), 0) || 1;
    return raw.map(d => ({
      name: d.name,
      value: d.value,
      percentage: typeof (d as any).percentage === 'number'
        ? (d as any).percentage
        : Math.round((d.value / total) * 100),
    }));
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const wrapLabel = (text: string, maxChars = LABEL_WRAP_MAX_CHARS, maxLines = LABEL_WRAP_MAX_LINES) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';

    for (const w of words) {
      const cand = cur ? `${cur} ${w}` : w;
      if (cand.length <= maxChars) {
        cur = cand;
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
      if (lines.length >= maxLines - 1 && cur.length > maxChars) break;
    }
    if (cur && lines.length < maxLines) lines.push(cur);

    const full = words.join(' ');
    const shown = lines.join(' ');
    const truncated = full.length > shown.length;
    if (truncated && lines.length) lines[lines.length - 1] += '…';

    return { lines, full };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabelWithLeader = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    const ratio = percent * 100;
    if (ratio < MIN_LABEL_PERCENT) return null;

    const RAD = Math.PI / 180;
    const cos = Math.cos(-midAngle * RAD);
    const sin = Math.sin(-midAngle * RAD);

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
    const color = getTypeColor(payload.name);
    const fullText = `${payload.name} ${Math.round(ratio)}%`;
    const { lines, full } = wrapLabel(fullText);

    return (
      <g style={{ pointerEvents: 'none' }}>
        <path d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`} stroke={color} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={color} />
        <text
          x={ex + (cos >= 0 ? 4 : -4)}
          y={ey}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fill="#333"
          fontSize={12}
        >
          <title>{full}</title>
          {lines.map((ln, i) => (
            <tspan key={i} x={ex + (cos >= 0 ? 4 : -4)} dy={i === 0 ? 0 : 14}>
              {ln}
            </tspan>
          ))}
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
          <p>{`${data.name}: ${data.percentage}% (${data.value}건)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="box chartContainer">
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
          <PieChart>
            <Pie
              data={donutData}
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
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getTypeColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeedbackTypeChart;