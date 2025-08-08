// src/components/analyze/FeedbackLineChart.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FeedbackPeriod } from '@/types/analyze';
import {
  feedbackDataByYear,
  availableYears,
  generateDailySatisfactionData,
  generateHourlySatisfactionData, // [ADD]
} from '@/constants/dummydata/DummyAnalyze';
import CustomDropDownForPeriod from '@/components/customDropdown/CustomDropDownForPeriod';
import './AnalyzeChart.scss';

// [UTIL] 해당 월의 시작/끝 날짜 문자열(YYYY-MM-DD)
const monthRange = (y: number, m: number) => {
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const endDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
  return { start, end };
};

type DailySatPoint = { day: number; sat: number; unsat: number };
type WeeklySatPoint = { week: number; sat: number; unsat: number };
type MonthlySatPoint = { month: number; sat: number; unsat: number };
type HourlySatPoint = { hour: number; sat: number; unsat: number };

const FeedbackLineChart: React.FC = () => {
  // 초기값을 고정값으로 설정
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState<number>(1);

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPeriod, setSelectedPeriod] = useState<FeedbackPeriod>('일별 보기');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // 클라이언트에서만 현재 시간 설정
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    setCurrentYear(year);
    setCurrentMonth(month);
    setCurrentDay(day);

    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
  }, []);

  // 기간별 표시 텍스트 가져오기
  const getDisplayText = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        return `${selectedYear}`;
      case '일별 보기':
        return `${selectedYear}.${String(selectedMonth).padStart(2, '0')}`;
      case '주별 보기':
        return `${selectedYear}.${String(selectedMonth).padStart(2, '0')}`;
      case '시간별 보기':
        return `${selectedYear}.${String(selectedMonth).padStart(2, '0')}.${String(selectedDay).padStart(2, '0')}`;
      default:
        return `${selectedYear}`;
    }
  };

  // [FIX] 모든 기간에서 듀얼 라인 데이터 생성(시간별 포함)
  const { data, xKey} = useMemo(() => {
    switch (selectedPeriod) {
      case '월별 보기': {
        const capMonth = (y: number, m: number) =>
          selectedYear === currentYear ? Math.min(m, currentMonth) : m;

        const months = feedbackDataByYear[selectedYear]?.map((d) => d.month) ?? [];
        const upTo = capMonth(selectedYear, months.length ? Math.max(...months) : 12);

        const arr: MonthlySatPoint[] = [];
        for (let m = 1; m <= upTo; m++) {
          const { start, end } = monthRange(selectedYear, m);
          const daily = generateDailySatisfactionData(start, end);
          let sat = 0, unsat = 0;
          daily.forEach((d) => {
            sat += d.satisfaction['만족'];
            unsat += d.satisfaction['불만족'];
          });
          arr.push({ month: m, sat, unsat });
        }
        return { data: arr, xKey: 'month', showDual: true };
      }

      case '일별 보기': {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const maxDay =
          selectedYear === currentYear && selectedMonth === currentMonth
            ? currentDay
            : daysInMonth;

        const { start, end } = monthRange(selectedYear, selectedMonth);
        const daily = generateDailySatisfactionData(start, end);
        const mapped: DailySatPoint[] = daily
          .map((d) => {
            const day = Number(d.date.split('-')[2]);
            return {
              day,
              sat: d.satisfaction['만족'],
              unsat: d.satisfaction['불만족'],
            };
          })
          .filter((p) => p.day <= maxDay);

        return { data: mapped, xKey: 'day', showDual: true };
      }

      case '주별 보기': {
        const { start, end } = monthRange(selectedYear, selectedMonth);
        const daily = generateDailySatisfactionData(start, end);
        const bucket = new Map<number, { sat: number; unsat: number }>();

        daily.forEach((d) => {
          const day = Number(d.date.split('-')[2]);
          const week = Math.ceil(day / 7);
          const prev = bucket.get(week) ?? { sat: 0, unsat: 0 };
          prev.sat += d.satisfaction['만족'];
          prev.unsat += d.satisfaction['불만족'];
          bucket.set(week, prev);
        });

        const maxWeek =
          selectedYear === currentYear && selectedMonth === currentMonth
            ? Math.ceil(currentDay / 7)
            : bucket.size;

        const result: WeeklySatPoint[] = Array.from(bucket.entries())
          .map(([week, v]) => ({ week, sat: v.sat, unsat: v.unsat }))
          .filter((p) => p.week <= maxWeek)
          .sort((a, b) => a.week - b.week);

        return { data: result, xKey: 'week', showDual: true };
      }

      case '시간별 보기': { 
        const isToday =
          selectedYear === currentYear &&
          selectedMonth === currentMonth &&
          selectedDay === currentDay;
        if (isToday) {
          return { data: [] as HourlySatPoint[], xKey: 'hour', showDual: true };
        }

        // [ADD] 시간별 만족/불만족 사용
        const hourly: HourlySatPoint[] = generateHourlySatisfactionData(selectedYear, selectedMonth, selectedDay);
        return { data: hourly, xKey: 'hour', showDual: true };
      }

      default:
        return { data: [], xKey: 'day', showDual: true };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedYear, selectedMonth, selectedDay, currentYear, currentMonth, currentDay]);

  // 이전/다음/변경 핸들러 — 기존과 동일 (생략 없이 유지)
  const handlePrev = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        if (selectedYear > Math.min(...availableYears)) setSelectedYear(selectedYear - 1);
        break;
      case '일별 보기':
      case '주별 보기':
        if (selectedMonth > 1) setSelectedMonth(selectedMonth - 1);
        else if (selectedYear > Math.min(...availableYears)) {
          setSelectedYear(selectedYear - 1);
          setSelectedMonth(12);
        }
        break;
      case '시간별 보기':
        if (selectedDay > 1) setSelectedDay(selectedDay - 1);
        else {
          if (selectedMonth > 1) {
            const prevMonth = selectedMonth - 1;
            const daysInPrevMonth = new Date(selectedYear, prevMonth, 0).getDate();
            setSelectedMonth(prevMonth);
            setSelectedDay(daysInPrevMonth);
          } else if (selectedYear > Math.min(...availableYears)) {
            setSelectedYear(selectedYear - 1);
            setSelectedMonth(12);
            setSelectedDay(31);
          }
        }
        break;
    }
  };

  const handleNext = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        if (selectedYear < Math.max(...availableYears)) setSelectedYear(selectedYear + 1);
        break;
      case '일별 보기':
      case '주별 보기': {
        if (selectedMonth < 12) setSelectedMonth(selectedMonth + 1);
        else if (selectedYear < Math.max(...availableYears)) {
          setSelectedYear(selectedYear + 1);
          setSelectedMonth(1);
        }
        break;
      }
      case '시간별 보기': {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        if (selectedDay < daysInMonth) setSelectedDay(selectedDay + 1);
        else {
          if (selectedMonth < 12) {
            setSelectedMonth(selectedMonth + 1);
            setSelectedDay(1);
          } else if (selectedYear < Math.max(...availableYears)) {
            setSelectedYear(selectedYear + 1);
            setSelectedMonth(1);
            setSelectedDay(1);
          }
        }
        break;
      }
    }
  };

  const handlePeriodChange = (period: FeedbackPeriod) => {
    setSelectedPeriod(period as FeedbackPeriod);
    switch (period) {
      case '월별 보기':
      case '일별 보기':
      case '주별 보기':
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedDay(currentDay);
        break;
      case '시간별 보기':
        if (typeof window !== 'undefined') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          setSelectedYear(yesterday.getFullYear());
          setSelectedMonth(yesterday.getMonth() + 1);
          setSelectedDay(yesterday.getDate());
        }
        break;
      default:
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedDay(currentDay);
    }
  };

  // 커스텀 툴팁(듀얼 라인 대응)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (!active || !payload || !payload.length) return null;
    const title =
      selectedPeriod === '월별 보기' ? `${label}월` :
      selectedPeriod === '일별 보기' ? `${label}일` :
      selectedPeriod === '주별 보기' ? `${label}주차` :
      selectedPeriod === '시간별 보기' ? `${label}시` : `${label}`;

    return (
      <div className="tooltip">
        <p style={{ marginBottom: 4 }}>{title}</p>
        {payload.map((p, i) => (
          <div key={i}>
            {p.name}: {p.value}건
          </div>
        ))}
      </div>
    );
  };

  // 버튼 비활성화 조건(기존 유지)
  const isPrevDisabled = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        return selectedYear <= Math.min(...availableYears);
      case '일별 보기':
      case '주별 보기':
        return selectedYear <= Math.min(...availableYears) && selectedMonth <= 1;
      case '시간별 보기':
        return selectedYear <= Math.min(...availableYears) && selectedMonth <= 1 && selectedDay <= 1;
      default:
        return false;
    }
  };
  const isNextDisabled = () => {
    const maxYear = Math.max(...availableYears);
    switch (selectedPeriod) {
      case '월별 보기':
        return selectedYear >= maxYear;
      case '일별 보기':
      case '주별 보기':
        return selectedYear >= maxYear && selectedMonth >= currentMonth;
      case '시간별 보기':
        if (typeof window !== 'undefined') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yy = yesterday.getFullYear();
          const ym = yesterday.getMonth() + 1;
          const yd = yesterday.getDate();
          return selectedYear >= yy && selectedMonth >= ym && selectedDay >= yd;
        }
        return false;
      default:
        return false;
    }
  };

  return (
    <div className="box chartContainer">
      <div style={{ marginBottom: '1rem' }}>
        <h3 className="chartTitle" style={{ marginBottom: '0.25rem' }}>피드백</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="yearControls">
            <button
              className="button is-small yearButton"
              onClick={handlePrev}
              disabled={isPrevDisabled()}
              style={{ opacity: isPrevDisabled() ? 0.3 : 1, cursor: isPrevDisabled() ? 'not-allowed' : 'pointer' }}
            >
              &lt;
            </button>
            <span className="yearText">{getDisplayText()}</span>
            <button
              className="button is-small yearButton"
              onClick={handleNext}
              disabled={isNextDisabled()}
              style={{ opacity: isNextDisabled() ? 0.3 : 1, cursor: isNextDisabled() ? 'not-allowed' : 'pointer' }}
            >
              &gt;
            </button>
          </div>
          <div className="periodSelector">
            <CustomDropDownForPeriod
              value={selectedPeriod}
              onChange={(period) => handlePeriodChange(period as FeedbackPeriod)}
            />
          </div>
        </div>
      </div>

      <div className="chartWrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data as any[]} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* 듀얼 라인: 모든 기간에서 sat/unsat 표시 */}
            <Line type="monotone" name="만족" dataKey="sat" stroke="#A8D8EA" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#A8D8EA' }} />
            <Line type="monotone" name="불만족" dataKey="unsat" stroke="#FF9AA2" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#FF9AA2' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeedbackLineChart