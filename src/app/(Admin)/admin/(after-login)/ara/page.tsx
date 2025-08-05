'use client';

import { useState, useCallback } from 'react';
import ChatbotSlider from '@/components/slider/ChatbotSlider';
import { SLIDER_CONFIG, SLIDER_TEXTS } from '@/constants/sliderConfig';
import type { SliderSettings } from '@/types/slider';
import './Ara.scss';

const PAGE_CONTENT = {
  TITLE: '챗봇 설정',
  DESCRIPTION: '챗봇의 연결 기준과 응답 스타일을 설정할 수 있습니다. 발화 유사도와 사고 스타일을 조절해 응답의 정밀도와 사고 표현을 자유롭게 조정하세요.',
  RANGE_INFO: '모든 설정은 1~10 사이 값으로 선택 가능합니다.',
} as const;

export default function ChatbotSettingsPage() {
  // 통합된 상태 관리
  const [settings, setSettings] = useState<SliderSettings>({
    similarity: SLIDER_CONFIG.DEFAULT_VALUE,
    style: SLIDER_CONFIG.DEFAULT_VALUE,
  });

  // 설정 변경 핸들러들
  const handleSimilarityChange = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, similarity: value }));
  }, []);

  const handleStyleChange = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, style: value }));
  }, []);

  return (
    <div className="chatbot-settings-page">
      <div className="container">
        <div className="admin-main-page-wrapper">
          <h1 className="admin-main-title">{PAGE_CONTENT.TITLE}</h1>
          <div className="admin-main-description">
            <p>{PAGE_CONTENT.DESCRIPTION}</p>
            <p>
              {PAGE_CONTENT.RANGE_INFO.split('1~10').map((part, index) => (
                index === 0 ? (
                  <span key={index}>{part}</span>
                ) : (
                  <span key={index}>
                    <span className="highlight">1~10</span>
                    {part}
                  </span>
                )
              ))}
            </p>
          </div>
        </div>

        <ChatbotSlider
          value={settings.similarity}
          onChange={handleSimilarityChange}
          label={SLIDER_TEXTS.SIMILARITY.LABEL}
          leftLabel={SLIDER_TEXTS.SIMILARITY.LEFT_LABEL}
          rightLabel={SLIDER_TEXTS.SIMILARITY.RIGHT_LABEL}
          tips={SLIDER_TEXTS.SIMILARITY.TIPS}
        />

        <ChatbotSlider
          value={settings.style}
          onChange={handleStyleChange}
          label={SLIDER_TEXTS.STYLE.LABEL}
          leftLabel={SLIDER_TEXTS.STYLE.LEFT_LABEL}
          rightLabel={SLIDER_TEXTS.STYLE.RIGHT_LABEL}
          tips={SLIDER_TEXTS.STYLE.TIPS}
        />
      </div>
    </div>
  );
}