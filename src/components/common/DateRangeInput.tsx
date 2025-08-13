// src/components/common/DateRangeInput.tsx
'use client';

import React from 'react';
import { DateRange } from '@/types/analyze';

interface DateRangeInputProps {
  dateRange: DateRange;
  onDateChange: (field: keyof DateRange, value: string) => void;
  companyCreatedAt?: string;
  className?: string;
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({
  dateRange,
  onDateChange,
  companyCreatedAt,
  className = '',
}) => {
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  return (
    <div className={`date-search-section ${className}`}>
      <input
        type="date"
        value={dateRange.startDate}
        onChange={(e) => onDateChange('startDate', e.target.value)}
        className="date-picker"
        min={companyCreatedAt || undefined}
        max={getCurrentDate()}
      />
      <span>~</span>
      <input
        type="date"
        value={dateRange.endDate}
        onChange={(e) => onDateChange('endDate', e.target.value)}
        className="date-picker"
        min={dateRange.startDate}
        max={getCurrentDate()}
      />
    </div>
  );
};

export default DateRangeInput;

