// 전역에서 로딩 스피너를 표시하기 위한 컴포넌트입니다.
"use client";
import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import LoadingSpinner from '@/components/spinner/Spinner';

const NavigationSpinner = () => {
  const { isNavigating } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem'
      }}>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#666' }}>
          페이지 이동 중...
        </p>
      </div>
    </div>
  );
};

export default NavigationSpinner;

