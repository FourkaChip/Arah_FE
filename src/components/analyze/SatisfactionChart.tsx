

'use client';
console.log('SatisfactionChart 최상단 렌더링');

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { DateRange, SatisfactionRaw } from '@/types/analyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import { TYPE_COLOR, MIN_LABEL_PERCENT } from '@/constants/analyzeConfig';
import { fetchSatisfactionRaw } from '@/api/admin/analyze/analyzeFetch';
import { convertSatisfactionResultToRows } from '@/constants/apiUtils';
import './AnalyzeChart.scss';

type Props = Record<string, never>; // 빈 props

const EMPTY_ROWS: SatisfactionRaw[] = [
  { type: '만족', value: 0, percentage: 50 },
  { type: '불만족', value: 0, percentage: 50 },
];

const SatisfactionChart: React.FC<Props> = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const [data, setData] = useState<SatisfactionRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'startDate' && next.endDate && value > next.endDate) next.endDate = value;
      return next;
    });
  };

  // ...기존 코드 유지...

  // 만족도 API 요청
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetchSatisfactionRaw({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      signal: ac.signal,
    })
      .then(result => setData(convertSatisfactionResultToRows(result)))
      .catch(err => {
        if (err?.name !== 'AbortError') {
          setError(typeof err?.message === 'string' ? err.message : '요청 실패');
        }
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [dateRange.startDate, dateRange.endDate]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabelWithLeader = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    const ratio = percent * 100;

    // payload에서 원본 데이터의 실제 percentage 값을 찾기
    const originalData = chartRows.find(row => row.type === payload.type);
    const actualPercentage = originalData ? originalData.percentage : Math.round(ratio);
    
    // 실제 percentage가 0%이거나 일반적인 MIN_LABEL_PERCENT 조건을 만족하면 표시
    if (actualPercentage === 0 || ratio >= MIN_LABEL_PERCENT) {
      // 라벨 표시 로직 계속 진행
    } else {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-midAngle * RADIAN);
    const startR = outerRadius + 6;
    const midR = outerRadius + 22;
    const endOffset = 24;

    const sx = cx + startR * cos;
    const sy = cy + startR * Math.sin(-midAngle * RADIAN);
    const mx = cx + midR * cos;
    const my = cy + midR * Math.sin(-midAngle * RADIAN);
    const ex = mx + (cos >= 0 ? endOffset : -endOffset);
    const ey = my;

    const textAnchor = cos >= 0 ? 'start' : 'end';
    const labelText = `${payload.type} ${actualPercentage}%`;
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
      const data = payload[0].payload as SatisfactionRaw;
      return (
        <div className="tooltip">
          <p>{`${data.type}: ${data.percentage}% (${data.value}건)`}</p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="box chartContainer">
        <div className="chartHeader"><h3 className="chartTitle">만족도</h3></div>
        <div className="chartWrapper"><p className="error">{error}</p></div>
      </div>
    );
  }

  const chartRows = data.length ? data : EMPTY_ROWS;

  // 시각적 차트 데이터 처리
  const totalValue = chartRows.reduce((sum, row) => sum + row.value, 0);
  const visualChartRows = totalValue === 0 
    ? chartRows.map(row => ({ ...row, value: 1 })) // 둘 다 0인 경우: 균등 표시를 위해 1로 설정
    : chartRows.map(row => ({
        ...row, 
        value: row.value === 0 ? 0.01 : row.value // 0인 경우 아주 작은 값으로 설정 (라벨 표시용)
      }));

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
        {loading ? (
          <p>불러오는 중…</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visualChartRows}
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
                {visualChartRows.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TYPE_COLOR[entry.type as '만족' | '불만족'] || '#888'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SatisfactionChart;