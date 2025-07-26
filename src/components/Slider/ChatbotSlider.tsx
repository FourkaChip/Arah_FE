// components/ChatbotSlider.tsx
'use client';

import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './ChatbotSlider.scss';

type ChatbotSliderProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  leftLabel: string;
  rightLabel: string;
  tip: string;
};

export default function ChatbotSlider({
  value,
  onChange,
  label,
  leftLabel,
  rightLabel,
  tip,
}: ChatbotSliderProps) {
  // 동적으로 marks 생성 - 현재 값만 강조, 0은 투명도 조절
  const createMarks = () => {
    const marks: { [key: number]: React.ReactNode } = {};
    for (let i = 0; i <= 10; i++) {
      let className = 'default-value';
      if (i === 0 && i === value) {
        className = 'zero-current-value';
      } else if (i === 0) {
        className = 'zero-value';
      } else if (i === value) {
        className = 'current-value';
      }
      
      marks[i] = (
        <span className={className}>
          {i}
        </span>
      );
    }
    return marks;
  };

  return (
    <div className="slider-block">
      <p className="slider-title">{label}</p>

      
      <div className="slider-tip-box-container"> 
        <div className="slider-tip-box">
          <p className="slider-tip-label">사용 팁</p>
          <div className="slider-tip-content">
            {tip.split(',').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
      

      <Slider
        min={0}
        max={10}
        marks={createMarks()}
        step={1}
        value={value}
        onChange={(value) => {
          const numValue = typeof value === 'number' ? value : value[0];
          // 0으로 가려고 하면 1로 튕기게 함
          onChange(numValue === 0 ? 1 : numValue);
        }}
        trackStyle={{ backgroundColor: '#2E3A8C', height: 8 }}
        handleStyle={{
          backgroundColor: '#fff',
          border: '2px solid #2E3A8C',
          height: 24,
          width: 24,
          marginTop: -8,
          marginBottom: 10,
        }}
        railStyle={{ backgroundColor: '#d3d3d3', height: 8 }}
        dotStyle={{ display: 'none' }}
      />
      <div className="slider-labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      
    </div>
  );
}