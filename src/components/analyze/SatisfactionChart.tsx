//src/components/analyze/SatisfactionChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { DateRange, SatisfactionRaw } from '@/types/analyze';
import { TYPE_COLOR, MIN_LABEL_PERCENT } from '@/constants/analyzeConfig';
import { fetchSatisfactionRaw, fetchCompanyCreatedAt } from '@/api/admin/analyze/analyzeFetch';
import { convertSatisfactionResultToRows } from '@/constants/apiUtils';
import './AnalyzeChart.scss';

type Props = Record<string, never>;

const EMPTY_ROWS: SatisfactionRaw[] = [
  { type: '만족', value: 0, percentage: 50 },
  { type: '불만족', value: 0, percentage: 50 },
];

const SatisfactionChart: React.FC<Props> = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [data, setData] = useState<SatisfactionRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyCreatedAt, setCompanyCreatedAt] = useState<string | null>(null);
  const [isDateRangeInitialized, setIsDateRangeInitialized] = useState(false);

  // 회사 가입일 조회 및 기본 날짜 범위 설정
  useEffect(() => {
    if (isDateRangeInitialized) return;
    
    fetchCompanyCreatedAt()
      .then(createdAt => {
        setCompanyCreatedAt(createdAt);
        
        // 기본 날짜 범위 설정
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        
        // 가입일이 한 달 전보다 늦으면 가입일을 시작일로 설정
        const startDate = createdAt > oneMonthAgoStr ? createdAt : oneMonthAgoStr;
        
        setDateRange({
          startDate,
          endDate: todayStr,
        });
        
        setIsDateRangeInitialized(true);
      })
      .catch(err => {
        console.error('가입일 조회 실패:', err);
        
        // 가입일 조회 실패 시 기본 한 달 범위로 설정
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        setDateRange({
          startDate: oneMonthAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        });
        
        setIsDateRangeInitialized(true);
      });
  }, [isDateRangeInitialized]);

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => {
      const next = { ...prev, [field]: value };
      
      // 시작일이 가입일보다 빠르면 가입일로 설정
      if (field === 'startDate' && companyCreatedAt && value < companyCreatedAt) {
        next.startDate = companyCreatedAt;
      }
      
      // 시작일이 종료일보다 늦으면 종료일을 시작일로 설정
      if (field === 'startDate' && next.endDate && next.startDate > next.endDate) {
        next.endDate = next.startDate;
      }
      
      return next;
    });
  };

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

  
  const renderLabelWithLeader = (props: any) => { // Recharts에서 제공하는 labelList props 타입이 복잡하므로 any 사용
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    const ratio = percent * 100;

    const originalData = chartRows.find(row => row.type === payload.type);
    const actualPercentage = originalData ? originalData.percentage : Math.round(ratio);
    
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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => { // Recharts Tooltip payload 타입이 복잡하므로 any 사용
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

  const totalValue = chartRows.reduce((sum, row) => sum + row.value, 0);
  const visualChartRows = totalValue === 0 
    ? chartRows.map(row => ({ ...row, value: 1 }))
    : chartRows.map(row => ({
        ...row, 
        value: row.value === 0 ? 0.01 : row.value
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
            min={companyCreatedAt || undefined}
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