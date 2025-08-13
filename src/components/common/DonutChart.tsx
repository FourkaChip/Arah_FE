// src/components/common/DonutChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { MIN_LABEL_PERCENT, LABEL_WRAP_MAX_CHARS, LABEL_WRAP_MAX_LINES } from '@/constants/analyzeConfig';

interface DonutChartData {
  name?: string;
  type?: string;
  value: number;
  percentage: number;
}

interface DonutChartProps {
  data: DonutChartData[];
  getColor: (key: string) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showWrappedLabels?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  getColor,
  loading = false,
  error = null,
  emptyMessage = '데이터가 없습니다.',
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  showWrappedLabels = false,
}) => {
  // 텍스트 줄바꿈 함수 (FeedbackTypeChart용)
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

  // 라벨을 리더 라인과 함께 렌더링 (공통 로직)
  const renderLabelWithLeader = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    percent?: number;
    payload?: DonutChartData;
  }) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    
    if (!cx || !cy || midAngle === undefined || !outerRadius || percent === undefined || !payload) {
      return null;
    }
    
    const ratio = percent * 100;
    const actualPercentage = payload.percentage || Math.round(ratio);
    
    if (actualPercentage === 0 || ratio >= MIN_LABEL_PERCENT) {
      // 라벨 표시 로직 계속 진행
    } else {
      return null;
    }

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
    const itemName = payload.name || payload.type || '';
    const color = getColor(itemName);
    const labelText = `${itemName} ${actualPercentage}%`;

    if (showWrappedLabels) {
      // FeedbackTypeChart용 - 긴 텍스트 줄바꿈
      const { lines, full } = wrapLabel(labelText);
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
    } else {
      // SatisfactionChart용 - 단순 라벨
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
    }
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DonutChartData;
      const itemName = data.name || data.type || '';
      return (
        <div className="tooltip">
          <p>{`${itemName}: ${data.percentage}% (${data.value}건)`}</p>
        </div>
      );
    }
    return null;
  };

  // 로딩, 에러, 빈 데이터 처리
  if (loading) {
    return <p>불러오는 중…</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data || data.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={0}
          dataKey="value"
          labelLine={false}
          label={renderLabelWithLeader}
          isAnimationActive={false}
        >
          {data.map((entry, index) => {
            const itemName = entry.name || entry.type || '';
            return (
              <Cell key={`cell-${index}`} fill={getColor(itemName)} />
            );
          })}
        </Pie>
        <Tooltip content={(props) => <CustomTooltip {...props} />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
