// src/app/(Admin)/admin/(after-login)/ara/page.tsx
'use client';

import ChatbotSlider from "@/components/slider/ChatbotSlider";
import { SLIDER_CONFIG, SLIDER_TEXTS } from "@/constants/sliderConfig";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCompanyChatbotSettings } from "@/hooks/useCompanyChatbotSettings";
import "./Ara.scss";

const PAGE_CONTENT = {
  TITLE: "챗봇 설정",
  DESCRIPTION:
    "챗봇의 연결 기준과 응답 스타일을 설정할 수 있습니다. 발화 유사도와 사고 스타일을 조절해 응답의 정밀도와 사고 표현을 자유롭게 조정하세요.",
  RANGE_INFO: "모든 설정은 1~10 사이 값으로 선택 가능합니다.",
} as const;

export default function ChatbotSettingsPage() {
  const {
    settings,
    onSimilarityChange,
    onSimilarityComplete,
    onStyleChange,
    onStyleComplete,
  } = useCompanyChatbotSettings();

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="chatbot-settings-page">
        <div className="container">
          <div className="admin-main-page-wrapper">
            <h1 className="admin-main-title">{PAGE_CONTENT.TITLE}</h1>
            <div className="admin-main-description">
              <p>{PAGE_CONTENT.DESCRIPTION}</p>
              <p>
                {PAGE_CONTENT.RANGE_INFO.split("1~10").map((part, idx) =>
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
            onChange={onSimilarityChange}
            onAfterChange ={onSimilarityComplete}
            label={SLIDER_TEXTS.SIMILARITY.LABEL}
            leftLabel={SLIDER_TEXTS.SIMILARITY.LEFT_LABEL}
            rightLabel={SLIDER_TEXTS.SIMILARITY.RIGHT_LABEL}
            tips={SLIDER_TEXTS.SIMILARITY.TIPS}
          />

          <ChatbotSlider
            value={settings.style}
            onChange={onStyleChange}
            onAfterChange ={onStyleComplete}
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