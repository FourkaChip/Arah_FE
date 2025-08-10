'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { DateRange } from '@/types/analyze';

const useDefaultDateRange = (): DateRange => {
  const [dateRange] = useState<DateRange>(() => ({
    startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  }));

  return dateRange;
};

export default useDefaultDateRange;