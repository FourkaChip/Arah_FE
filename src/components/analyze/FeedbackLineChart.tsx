'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FeedbackPeriod } from '@/types/analyze';
import { 
  feedbackDataByYear, 
  availableYears, 
  periodOptions,
  dailyFeedbackData,
  weeklyFeedbackData,
  hourlyFeedbackData,
  generateDailyData,
  generateWeeklyData,
  generateHourlyData
} from '@/constants/dummydata/feedback';
import CustomDropDownForPeriod from '@/components/CustomDropdown/CustomDropDownForPeriod';
import './AnalyzeChart.scss';

const FeedbackLineChart: React.FC = () => {
  // 초기값을 고정값으로 설정
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [currentHour, setCurrentHour] = useState<number>(0);
  
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPeriod, setSelectedPeriod] = useState<FeedbackPeriod>('일별 보기');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // 클라이언트에서만 현재 시간 설정
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    
    setCurrentYear(year);
    setCurrentMonth(month);
    setCurrentDay(day);
    setCurrentHour(hour);
    
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedWeek(Math.ceil(day / 7));
    setSelectedDay(day);
  }, []);

  // 기간별 표시 텍스트 가져오기
  const getDisplayText = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        return `${selectedYear}`;
      case '일별 보기':
        return `${selectedYear}.${selectedMonth.toString().padStart(2, '0')}`;
      case '주별 보기':
        return `${selectedYear}.${selectedMonth.toString().padStart(2, '0')}`;
      case '시간별 보기':
        return `${selectedYear}.${selectedMonth.toString().padStart(2, '0')}.${selectedDay.toString().padStart(2, '0')}`;
      default:
        return `${selectedYear}`;
    }
  };

  // 기간별 데이터 가져오기
  const getDataByPeriod = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        const rawData = feedbackDataByYear[selectedYear] || [];
        return selectedYear === currentYear 
          ? rawData.filter(d => d.month <= currentMonth)
          : rawData;
      
      case '일별 보기':
        const dailyData = generateDailyData(selectedYear, selectedMonth);
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const maxDay = (selectedYear === currentYear && selectedMonth === currentMonth) ? currentDay : daysInMonth;
        return dailyData.filter(d => d.day <= maxDay);
      
      case '주별 보기':
        const weeklyData = generateWeeklyData(selectedYear, selectedMonth);
        const maxWeek = (selectedYear === currentYear && selectedMonth === currentMonth) ? Math.ceil(currentDay / 7) : weeklyData.length;
        return weeklyData.filter(d => d.week <= maxWeek);
      
      case '시간별 보기':
        // 시간별 보기는 전날까지만 표시
        const isToday = (selectedYear === currentYear && selectedMonth === currentMonth && selectedDay === currentDay);
        if (isToday) {
          return []; // 오늘은 데이터 없음
        }
        const hourlyData = generateHourlyData(selectedYear, selectedMonth, selectedDay);
        return hourlyData; // 전날 이전이면 24시간 전체 데이터
      
      default:
        return [];
    }
  };

  // 기간별 X축 설정
  const getXAxisProps = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        return { dataKey: 'month', label: '월' };
      case '일별 보기':
        return { dataKey: 'day', label: '일' };
      case '주별 보기':
        return { dataKey: 'week', label: '주' };
      case '시간별 보기':
        return { dataKey: 'hour', label: '시' };
      default:
        return { dataKey: 'month', label: '월' };
    }
  };

  const currentData = getDataByPeriod();
  const xAxisProps = getXAxisProps();

  // 기간별 이전/다음 버튼 핸들러
  const handlePrev = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        if (selectedYear > Math.min(...availableYears)) {
          setSelectedYear(selectedYear - 1);
        }
        break;
      case '일별 보기':
        if (selectedMonth > 1) {
          setSelectedMonth(selectedMonth - 1);
        } else if (selectedYear > Math.min(...availableYears)) {
          setSelectedYear(selectedYear - 1);
          setSelectedMonth(12);
        }
        break;
      case '주별 보기':
        // 일별 보기와 동일하게 월 단위로 변경
        if (selectedMonth > 1) {
          setSelectedMonth(selectedMonth - 1);
        } else if (selectedYear > Math.min(...availableYears)) {
          setSelectedYear(selectedYear - 1);
          setSelectedMonth(12);
        }
        break;
      case '시간별 보기':
        if (selectedDay > 1) {
          setSelectedDay(selectedDay - 1);
        } else {
          // 이전 달의 마지막 날로 이동
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
        if (selectedYear < Math.max(...availableYears)) {
          setSelectedYear(selectedYear + 1);
        }
        break;
      case '일별 보기':
        if (selectedMonth < 12) {
          setSelectedMonth(selectedMonth + 1);
        } else if (selectedYear < Math.max(...availableYears)) {
          setSelectedYear(selectedYear + 1);
          setSelectedMonth(1);
        }
        break;
      case '주별 보기':
        // 일별 보기와 동일하게 월 단위로 변경
        if (selectedMonth < 12) {
          setSelectedMonth(selectedMonth + 1);
        } else if (selectedYear < Math.max(...availableYears)) {
          setSelectedYear(selectedYear + 1);
          setSelectedMonth(1);
        }
        break;
      case '시간별 보기':
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        if (selectedDay < daysInMonth) {
          setSelectedDay(selectedDay + 1);
        } else {
          // 다음 달의 첫 날로 이동
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
  };

  // 기간별 이전/다음 버튼 비활성화 조건
  const isPrevDisabled = () => {
    switch (selectedPeriod) {
      case '월별 보기':
        return selectedYear <= Math.min(...availableYears);
      case '일별 보기':
        return selectedYear <= Math.min(...availableYears) && selectedMonth <= 1;
      case '주별 보기':
        // 일별 보기와 동일하게 월 단위로 체크
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
        return selectedYear >= maxYear && selectedMonth >= currentMonth;
      case '주별 보기':
        // 일별 보기와 동일하게 월 단위로 체크
        return selectedYear >= maxYear && selectedMonth >= currentMonth;
      case '시간별 보기':
        // 시간별 보기는 전날까지만 가능 (오늘은 불가)
        if (typeof window !== 'undefined') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayYear = yesterday.getFullYear();
          const yesterdayMonth = yesterday.getMonth() + 1;
          const yesterdayDay = yesterday.getDate();
          
          return selectedYear >= yesterdayYear && selectedMonth >= yesterdayMonth && selectedDay >= yesterdayDay;
        }
        return false;
      default:
        return false;
    }
  };

  // 기간 변경 핸들러
  const handlePeriodChange = (period: FeedbackPeriod) => {
    setSelectedPeriod(period as FeedbackPeriod);
    
    // 기간별로 적절한 초기값 설정
    switch (period) {
      case '월별 보기':
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedWeek(Math.ceil(currentDay / 7));
        setSelectedDay(currentDay);
        break;
        
      case '일별 보기':
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedWeek(Math.ceil(currentDay / 7));
        setSelectedDay(currentDay);
        break;
        
      case '주별 보기':
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedWeek(Math.ceil(currentDay / 7));
        setSelectedDay(currentDay);
        break;
        
      case '시간별 보기':
        // 시간별 보기의 경우 전날로 설정 (클라이언트에서만)
        if (typeof window !== 'undefined') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          setSelectedYear(yesterday.getFullYear());
          setSelectedMonth(yesterday.getMonth() + 1);
          setSelectedDay(yesterday.getDate());
          setSelectedWeek(Math.ceil(yesterday.getDate() / 7));
        }
        break;
        
      default:
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedWeek(Math.ceil(currentDay / 7));
        setSelectedDay(currentDay);
    }
  };

  // 기간별 툴팁 텍스트
  const getTooltipText = (label: string, value: number) => {
    switch (selectedPeriod) {
      case '월별 보기':
        return `${label}월: ${value}건`;
      case '일별 보기':
        return `${label}일: ${value}건`;
      case '주별 보기':
        return `${label}주차: ${value}건`;
      case '시간별 보기':
        return `${label}시: ${value}건`;
      default:
        return `${label}: ${value}건`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip">
          <p>{getTooltipText(label || '', payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`box chartContainer`}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 className="chartTitle" style={{ marginBottom: '0.25rem' }}>피드백</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="yearControls">
            <button
              className={`button is-small yearButton`}
              onClick={handlePrev}
              disabled={isPrevDisabled()}
              style={{ 
                opacity: isPrevDisabled() ? 0.3 : 1,
                cursor: isPrevDisabled() ? 'not-allowed' : 'pointer'
              }}
            >
              &lt;
            </button>
            <span className="yearText">{getDisplayText()}</span>
            <button
              className={`button is-small yearButton`}
              onClick={handleNext}
              disabled={isNextDisabled()}
              style={{ 
                opacity: isNextDisabled() ? 0.3 : 1,
                cursor: isNextDisabled() ? 'not-allowed' : 'pointer'
              }}
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
          <LineChart data={currentData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisProps.dataKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#A8D8EA"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: '#A8D8EA' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeedbackLineChart; 