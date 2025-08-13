// src/components/common/ChartHeader.tsx
'use client';

import React from 'react';
import { DateRange } from '@/types/analyze';
import DateRangeInput from './DateRangeInput';

interface ChartHeaderProps {
  title: string;
  dateRange: DateRange;
  onDateChange: (field: keyof DateRange, value: string) => void;
  companyCreatedAt?: string;
  showDateRange?: boolean;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  title,
  dateRange,
  onDateChange,
  companyCreatedAt,
  showDateRange = true,
}) => {
  return (
    <div className="chartHeader">
      <h3 className="chartTitle">{title}</h3>
      {showDateRange && (
        <DateRangeInput
          dateRange={dateRange}
          onDateChange={onDateChange}
          companyCreatedAt={companyCreatedAt}
        />
      )}
    </div>
  );
};

export default ChartHeader;
