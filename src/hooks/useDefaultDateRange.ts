'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { DateRange } from '@/types/analyze';

const useDefaultDateRange = (): DateRange => {
  // 초기값을 함수 형태로 전달해서 한 번만 계산하도록 함
  const [dateRange] = useState<DateRange>(() => ({
    startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  }));

  return dateRange;
};

export default useDefaultDateRange;