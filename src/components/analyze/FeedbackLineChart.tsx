// src/components/analyze/FeedbackLineChart.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { FeedbackPeriod } from '@/types/analyze';
import {
  feedbackDataByYear,
  availableYears,
  generateDailySatisfactionData,
  generateHourlySatisfactionData,
} from '@/constants/dummydata/DummyAnalyze';
import {
  SATIS_COLOR,
  UNSAT_COLOR,
} from '@/constants/analyzeConfig';
import CustomDropDownForPeriod from '@/components/customDropdown/CustomDropDownForPeriod';
import './AnalyzeChart.scss';

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
type SatPoint = DailySatPoint | WeeklySatPoint | MonthlySatPoint | HourlySatPoint;

const FeedbackLineChart: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState<number>(1);

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPeriod, setSelectedPeriod] = useState<FeedbackPeriod>('일별 보기');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setCurrentDay(now.getDate());

    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  }, []);

  const getDisplayText = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        return `${selectedYear}`;
      case '일별 보기':
      case '주별 보기':
        return `${selectedYear}.${String(selectedMonth).padStart(2, '0')}`;
      case '시간별 보기':
        return `${selectedYear}.${String(selectedMonth).padStart(2, '0')}.${String(selectedDay).padStart(2, '0')}`;
      default:
        return `${selectedYear}`;
    }
  };

  const { data, xKey } = useMemo(() => {
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
        return { data: arr as SatPoint[], xKey: 'month' as const };
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

        return { data: mapped as SatPoint[], xKey: 'day' as const };
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

        return { data: result as SatPoint[], xKey: 'week' as const };
      }

      case '시간별 보기': {
        const isToday =
          selectedYear === currentYear &&
          selectedMonth === currentMonth &&
          selectedDay === currentDay;

        if (isToday) {
          return { data: [] as SatPoint[], xKey: 'hour' as const };
        }

        const hourly: HourlySatPoint[] = generateHourlySatisfactionData(
          selectedYear, selectedMonth, selectedDay
        );
        return { data: hourly as SatPoint[], xKey: 'hour' as const };
      }

      default:
        return { data: [] as SatPoint[], xKey: 'day' as const };
    }
  }, [
    selectedPeriod, selectedYear, selectedMonth, selectedDay,
    currentYear, currentMonth, currentDay,
  ]);

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
    setSelectedPeriod(period);
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

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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
          <LineChart data={data as SatPoint[]} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" name="만족" dataKey="sat" stroke={SATIS_COLOR} strokeWidth={4} dot={false} activeDot={{ r: 6, fill: SATIS_COLOR }} />
            <Line type="monotone" name="불만족" dataKey="unsat" stroke={UNSAT_COLOR} strokeWidth={4} dot={false} activeDot={{ r: 6, fill: UNSAT_COLOR }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeedbackLineChart;