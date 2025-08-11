// 전역에서 로딩 스피너를 표시하기 위한 컴포넌트입니다.
"use client";
import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import SpinnerOverlay from './SpinnerOverlay';

const NavigationSpinner = () => {
  const { isNavigating, isPageLoading } = useNavigation();

  if (!isNavigating && !isPageLoading) return null;

  const message = isPageLoading ? '페이지 로딩 중...' : '페이지 이동 중...';

  return <SpinnerOverlay message={message} />;
};

export default NavigationSpinner;
