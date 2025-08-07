// src/app/(Admin)/admin/(after-login)/ara/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatbotSlider from '@/components/slider/ChatbotSlider';
import { SLIDER_CONFIG, SLIDER_TEXTS } from '@/constants/sliderConfig';
import type { SliderSettings } from '@/types/slider';
import './Ara.scss';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  getCompanyChatbotSettings,
  updateCompanyChatbotSettings,
} from '@/api/admin/ara/araFetch';

const PAGE_CONTENT = {
  TITLE: '챗봇 설정',
  DESCRIPTION:
    '챗봇의 연결 기준과 응답 스타일을 설정할 수 있습니다. 발화 유사도와 사고 스타일을 조절해 응답의 정밀도와 사고 표현을 자유롭게 조정하세요.',
  RANGE_INFO: '모든 설정은 1~10 사이 값으로 선택 가능합니다.',
} as const;

export default function ChatbotSettingsPage() {
  const [settings, setSettings] = useState<SliderSettings>({
    similarity: SLIDER_CONFIG.DEFAULT_VALUE,
    style: SLIDER_CONFIG.DEFAULT_VALUE,
  });

  // 1) 초기값 로딩
  useEffect(() => {
    (async () => {
      try {
        const data = await getCompanyChatbotSettings();
        setSettings(data);
      } catch (err) {
        console.error('[초기값 로딩 실패]', err);
      }
    })();
  }, []);

  // 2) 슬라이더 onChange 핸들러
  const handleSimilarityChange = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, similarity: value }));
  }, []);
  const handleStyleChange = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, style: value }));
  }, []);

  // 3) 슬라이더 조작 종료 시 바로 서버 업데이트
  const handleSimilarityAfter = useCallback(
    (value: number) => {
      const newSettings = { ...settings, similarity: value };
      updateCompanyChatbotSettings(newSettings).catch((err) =>
        console.error('[유사도 업데이트 실패]', err)
      );
    },
    [settings]
  );
  const handleStyleAfter = useCallback(
    (value: number) => {
      const newSettings = { ...settings, style: value };
      updateCompanyChatbotSettings(newSettings).catch((err) =>
        console.error('[스타일 업데이트 실패]', err)
      );
    },
    [settings]
  );

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="chatbot-settings-page">
        <div className="container">
          <div className="admin-main-page-wrapper">
            <h1 className="admin-main-title">{PAGE_CONTENT.TITLE}</h1>
            <div className="admin-main-description">
              <p>{PAGE_CONTENT.DESCRIPTION}</p>
              <p>
                {PAGE_CONTENT.RANGE_INFO.split('1~10').map((part, idx) =>
                  idx === 0 ? (
                    <span key={idx}>{part}</span>
                  ) : (
                    <span key={idx}>
                      <span className="highlight">1~10</span>
                      {part}
                    </span>
                  )
                )}
              </p>
            </div>
          </div>

          <ChatbotSlider
            value={settings.similarity}
            onChange={handleSimilarityChange}
            onAfterChange={handleSimilarityAfter}
            label={SLIDER_TEXTS.SIMILARITY.LABEL}
            leftLabel={SLIDER_TEXTS.SIMILARITY.LEFT_LABEL}
            rightLabel={SLIDER_TEXTS.SIMILARITY.RIGHT_LABEL}
            tips={SLIDER_TEXTS.SIMILARITY.TIPS}
          />

          <ChatbotSlider
            value={settings.style}
            onChange={handleStyleChange}
            onAfterChange={handleStyleAfter}
            label={SLIDER_TEXTS.STYLE.LABEL}
            leftLabel={SLIDER_TEXTS.STYLE.LEFT_LABEL}
            rightLabel={SLIDER_TEXTS.STYLE.RIGHT_LABEL}
            tips={SLIDER_TEXTS.STYLE.TIPS}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}