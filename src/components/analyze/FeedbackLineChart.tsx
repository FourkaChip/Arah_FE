// src/components/analyze/FeedbackLineChart.tsx
'use client';

import React, { useState, useEffect} from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { FeedbackPeriod } from '@/types/analyze';
import {
  availableYears,
} from '@/constants/dummydata/DummyAnalyze';
import {
  fetchFeedbackHourlyCount,
  fetchFeedbackDailyCount,
  fetchFeedbackWeeklyCount,
  fetchFeedbackMonthlyCount,
} from '@/api/admin/analyze/analyzeFetch';
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

type FeedbackLineChartProps = Record<string, never>; // 빈 props

const FeedbackLineChart: React.FC<FeedbackLineChartProps> = () => {
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState<number>(1);

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPeriod, setSelectedPeriod] = useState<FeedbackPeriod>('일별 보기');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [data, setData] = useState<SatPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // API 데이터 fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    const ac = new AbortController();
    const fetchData = async () => {
      try {
        let result: any[] = [];
        if (selectedPeriod === '시간별 보기') {
          const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
          result = await fetchFeedbackHourlyCount({ date, signal: ac.signal });
          const chartData = Array.from({ length: 24 }, (_, hour) => {
            const found = result.find((d: any) => d.hour === hour);
            return {
              hour,
              sat: found ? found.like_count : 0,
              unsat: found ? found.unlike_count : 0,
            };
          });
          setData(chartData);
        } else if (selectedPeriod === '일별 보기') {
          result = await fetchFeedbackDailyCount({ year: selectedYear, month: selectedMonth, signal: ac.signal });
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const resultMap = new Map(result.map((d: any) => [d.day, d]));
          const chartData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const found = resultMap.get(day);
            return {
              day,
              sat: found ? found.like_count : 0,
              unsat: found ? found.unlike_count : 0,
            };
          });
          setData(chartData);
        } else if (selectedPeriod === '주별 보기') {
          result = await fetchFeedbackWeeklyCount({ year: selectedYear, month: selectedMonth, signal: ac.signal });
          
          // 해당 월의 실제 주차 수 계산
          const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
          const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);
          
          // 첫 번째 날의 주차 계산 (일요일을 주의 시작으로 가정)
          const firstWeek = Math.ceil((firstDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7);
          const lastWeek = Math.ceil((lastDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7);
          
          const resultMap = new Map(result.map((d: any) => [d.week, d]));
          const chartData = [];
          
          for (let week = firstWeek; week <= lastWeek; week++) {
            const found = resultMap.get(week);
            chartData.push({
              week,
              sat: found ? found.like_count : 0,
              unsat: found ? found.unlike_count : 0,
            });
          }
          setData(chartData);
        } else if (selectedPeriod === '월별 보기') {
          result = await fetchFeedbackMonthlyCount({ year: selectedYear, signal: ac.signal });
          const chartData = result.map((d: any) => ({ month: d.month, sat: d.like_count, unsat: d.unlike_count }));
          setData(chartData);
        }
      } catch (err: any) {
        setError(typeof err?.message === 'string' ? err.message : '요청 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => ac.abort();
  }, [selectedPeriod, selectedYear, selectedMonth, selectedDay]);

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

  const CustomTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
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
        {loading ? (
          <p>불러오는 중…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : data.length === 0 ? (
          <p className="empty">데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data as SatPoint[]} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={
                selectedPeriod === '월별 보기' ? 'month' :
                selectedPeriod === '일별 보기' ? 'day' :
                selectedPeriod === '주별 보기' ? 'week' :
                'hour'
              } axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
              <Tooltip content={(props) => <CustomTooltip {...props} />} />
              <Legend />
              <Line type="monotone" name="만족" dataKey="sat" stroke={SATIS_COLOR} strokeWidth={4} dot={false} activeDot={{ r: 6, fill: SATIS_COLOR }} />
              <Line type="monotone" name="불만족" dataKey="unsat" stroke={UNSAT_COLOR} strokeWidth={4} dot={false} activeDot={{ r: 6, fill: UNSAT_COLOR }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default FeedbackLineChart;