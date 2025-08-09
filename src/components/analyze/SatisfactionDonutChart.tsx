// src/components/analyze/SatisfactionDonutChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRange } from '@/types/analyze';
import { aggregateSatisfactionData } from '@/constants/dummydata/DummyAnalyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import './AnalyzeChart.scss';

// [ADD] 도넛/라인 통일 팔레트 (만족/불만족)
const SATIS_COLOR = '#A8D8EA'; // 만족
const UNSAT_COLOR = '#FF9AA2'; // 불만족
const TYPE_COLOR: Record<'만족' | '불만족', string> = {
  만족: SATIS_COLOR,
  불만족: UNSAT_COLOR,
};

const SatisfactionDonutChart: React.FC = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  // 선택한 기간에 따른 만족도 데이터 계산
  const satisfactionData = useMemo(() => {
    return aggregateSatisfactionData(dateRange.startDate, dateRange.endDate);
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  // [ADD] 리더라인 + 조각 외부 라벨 렌더러
  //  - midAngle/outerRadius를 사용해 도넛 밖으로 라벨 배치
  //  - 아주 작은 비율(예: 3%)은 라벨 생략해 겹침/노이즈 방지
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabelWithLeader = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    const ratio = percent * 100;
    if (ratio < 3) return null; // [ADD] 작은 조각 라벨 생략

    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);

    const startR = outerRadius + 6;   // 라벨 라인 시작 반경
    const midR = outerRadius + 22;    // 꺾이는 지점 반경
    const endOffset = 24;             // 텍스트 끝단 x 오프셋

    const sx = cx + startR * cos;
    const sy = cy + startR * sin;

    const mx = cx + midR * cos;
    const my = cy + midR * sin;

    const ex = mx + (cos >= 0 ? endOffset : -endOffset);
    const ey = my;

    const textAnchor = cos >= 0 ? 'start' : 'end';
    const labelText = `${payload.type} ${Math.round(ratio)}%`;

    return (
      <g>
        {/* 리더라인 */}
        <path d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`} stroke={TYPE_COLOR[payload.type as '만족' | '불만족'] || '#888'} fill="none" />
        {/* 끝 점 표시(작은 동그라미) */}
        <circle cx={ex} cy={ey} r={2} fill={TYPE_COLOR[payload.type as '만족' | '불만족'] || '#888'} />
        {/* 라벨 텍스트 */}
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

  // 커스텀 툴팁 - 타입/퍼센트/건수 표시
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
              // [FIX] 기존 중앙 퍼센트 라벨/기본 라인 제거 → 커스텀 라벨+리더라인으로 대체
              labelLine={false}
              label={renderLabelWithLeader}
              isAnimationActive={false}
            >
              {satisfactionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  // [FIX] 인덱스 기반 배열 → 타입 기반 맵으로 안정적 색상 매핑
                  fill={TYPE_COLOR[entry.type as '만족' | '불만족'] || '#888'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* [FIX] 하단 범례 제거: 라벨을 조각 근처에 표시하므로 별도 legend 불필요 */}
    </div>
  );
};

export default SatisfactionDonutChart;