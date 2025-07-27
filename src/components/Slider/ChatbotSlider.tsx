// components/ChatbotSlider.tsx
'use client';

import React, { useMemo, useCallback } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './ChatbotSlider.scss';
import { SLIDER_CONFIG, COLORS } from '@/constants/sliderConfig';
import type { ChatbotSliderProps, MarkStyleType } from '@/types/slider';

export default function ChatbotSlider({
  value,
  onChange,
  label,
  leftLabel,
  rightLabel,
  tips,
}: ChatbotSliderProps) {
  // 스타일 객체들을 useMemo로 메모화
  const sliderStyles = useMemo(() => ({
    trackStyle: { 
      backgroundColor: COLORS.PRIMARY, 
      height: 8 
    },
    handleStyle: {
      backgroundColor: COLORS.WHITE,
      border: `2px solid ${COLORS.PRIMARY}`,
      height: 24,
      width: 24,
      marginTop: -8,
      marginBottom: 10,
    },
    railStyle: { 
      backgroundColor: COLORS.RAIL_GRAY, 
      height: 8 
    },
    dotStyle: { 
      display: 'none' 
    },
  }), []);

  // 마크 클래스명 결정 함수
  const getMarkClassName = useCallback((index: number, currentValue: number): MarkStyleType => {
    if (index === 0) return 'zero-value';
    if (index === currentValue) return 'current-value';
    return 'default-value';
  }, []);

  // 동적으로 marks 생성 - useMemo로 최적화
  const marks = useMemo(() => {
    const marksObject: { [key: number]: React.ReactNode } = {};
    
    for (let i = SLIDER_CONFIG.MIN_VALUE; i <= SLIDER_CONFIG.MAX_VALUE; i++) {
      const className = getMarkClassName(i, value);
      marksObject[i] = (
        <span className={className} key={i}>
          {i}
        </span>
      );
    }
    
    return marksObject;
  }, [value, getMarkClassName]);

  // onChange 핸들러 최적화
  const handleChange = useCallback((sliderValue: number | number[]) => {
    const numValue = typeof sliderValue === 'number' ? sliderValue : sliderValue[0];
    // 0으로 가려고 하면 1로 튕기게 함
    onChange(numValue === 0 ? SLIDER_CONFIG.SELECTABLE_MIN : numValue);
  }, [onChange]);

  return (
    <div className="slider-block">
      <h3 className="slider-title">{label}</h3>

      <div className="slider-tip-box-container">
        <div className="slider-tip-box">
          <p className="slider-tip-label">사용 팁</p>
          <div className="slider-tip-content">
            {tips.map((tip, index) => (
              <p key={index}>{tip}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="slider-wrapper">
        <Slider
          min={SLIDER_CONFIG.MIN_VALUE}
          max={SLIDER_CONFIG.MAX_VALUE}
          marks={marks}
          step={SLIDER_CONFIG.STEP}
          value={value}
          onChange={handleChange}
          trackStyle={sliderStyles.trackStyle}
          handleStyle={sliderStyles.handleStyle}
          railStyle={sliderStyles.railStyle}
          dotStyle={sliderStyles.dotStyle}
        />
      </div>

      <div className="slider-labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}