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
        marks={{ 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10' }}
        step={1}
        value={value}
        onChange={(value) => onChange(typeof value === 'number' ? value : value[0])}
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