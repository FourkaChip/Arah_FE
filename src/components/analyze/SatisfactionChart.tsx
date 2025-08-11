

'use client';
console.log('SatisfactionChart 최상단 렌더링');

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRange } from '@/types/analyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import { TYPE_COLOR, MIN_LABEL_PERCENT } from '@/constants/analyzeConfig';
import { fetchSatisfactionRaw, type SatisfactionRaw, convertSatisfactionResultToRows } from '@/api/admin/analyze/analyzeFetch';
import { authorizedFetch } from '@/api/auth/authorizedFetch';
import './AnalyzeChart.scss';

type Props = { companyId: number | null };

const EMPTY_ROWS: SatisfactionRaw[] = [
  { type: '만족', value: 0, percentage: 0 },
  { type: '불만족', value: 0, percentage: 0 },
];

const SatisfactionChart: React.FC<Props> = ({ companyId }) => {
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

  useEffect(() => {
    if (companyId !== null) {
      console.log('SatisfactionChart companyId:', companyId);
    }
  }, [companyId]);

  // companyId가 있을 때 만족도 API 요청
  useEffect(() => {
    if (companyId == null || !dateRange.startDate || !dateRange.endDate) return;
    let ac = new AbortController();
    setLoading(true);
    setError(null);
    fetchSatisfactionRaw({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      companyId,
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
  }, [companyId, dateRange.startDate, dateRange.endDate]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabelWithLeader = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    const ratio = percent * 100;
    if (ratio < MIN_LABEL_PERCENT) return null;

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
  const d = payload[0].payload as SatisfactionRaw;
      return (
        <div className="tooltip">
          <p>{`${d.type}: ${d.percentage}% (${d.value}건)`}</p>
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
                data={chartRows}
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
                {chartRows.map((entry, index) => (
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