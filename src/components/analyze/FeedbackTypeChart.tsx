// FourKa_FE/src/components/analyze/FeedbackTypeDonutChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRange } from '@/types/analyze';
import { aggregateFeedbackTypeData } from '@/constants/dummydata/DummyAnalyze';
import useDefaultDateRange from '@/hooks/useDefaultDateRange';
import './AnalyzeChart.scss';

// [ADD] 피드백 유형별 팔레트 (조각/리더라인 색상 통일)
const TYPE_COLORS: Record<string, string> = {
  '오래된 정보': '#C8A8E9',
  '질문 의도 파악 실패': '#FFD3B6',
  '잘못된 답변': '#FFCCCC',
  '정보 누락': '#A8D8EA',
  '기타': '#B8E6B8',
};
const getTypeColor = (type: string) => TYPE_COLORS[type] ?? '#888';

const FeedbackTypeChart: React.FC = () => {
  const initialRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  // 선택한 기간에 따른 유형 분포 데이터 계산 + 퍼센트 보정
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

  // [ADD] 리더라인 + 외부 라벨 (SatisfactionDonutChart와 동일 스타일)
  // - midAngle/outerRadius 기반, 도넛 밖에 라벨
  // - 3% 미만 조각은 라벨 생략
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
// 1) util: 단어 단위 2줄 래핑 + 축약 여부 반환
const wrapLabel = (text: string, maxChars = 8, maxLines = 2) => {
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

  // 화면엔 …로 표시
  if (truncated && lines.length) {
    lines[lines.length - 1] = lines[lines.length - 1] + '…';
  }
  return { lines, truncated, full };
};

// 2) 라벨 렌더러: <title>로 전체 문구 노출
const renderLabelWithLeader = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, payload } = props;
  const ratio = percent * 100;
  if (ratio < 3) return null;

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
  const { lines, truncated, full } = wrapLabel(fullText, 8, 2);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* 리더라인 + 끝 점 */}
      <path d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`} stroke={color} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={color} />

      {/* 라벨 텍스트 + 전체 문구 타이틀 */}
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fill="#333"
        fontSize={12}
      >
        {/* 마우스 오버 시 브라우저 네이티브 툴팁로 전체 문구 노출 */}
        <title>{full}</title>
        {lines.map((ln: string, i: number) => (
          <tspan
            key={i}
            x={ex + (cos >= 0 ? 4 : -4)}
            dy={i === 0 ? 0 : 14}
          >
            {ln}
          </tspan>
        ))}
      </text>
    </g>
  );
};
  // [ADD] 커스텀 툴팁 (유형/퍼센트/건수)
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
              // [FIX] 중앙 라벨/기본 라인 제거 → 커스텀 라벨+리더라인 사용
              labelLine={false}
              label={renderLabelWithLeader}
              isAnimationActive={false}
            >
              {donutData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getTypeColor(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* [FIX] 하단 범례 제거: 조각 근처 라벨로 대체 */}
    </div>
  );
};

export default FeedbackTypeChart;