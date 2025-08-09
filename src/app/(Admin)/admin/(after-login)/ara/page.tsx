// src/app/(Admin)/admin/(after-login)/ara/page.tsx
'use client';
import { Toaster } from 'react-hot-toast';
import ChatbotSlider from "@/components/slider/ChatbotSlider";
import { SLIDER_CONFIG, SLIDER_TEXTS } from "@/constants/sliderConfig";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCompanyChatbotSettings } from "@/hooks/useCompanyChatbotSettings";
import "./Ara.scss";
import { PAGE_CONTENT } from "@/constants/pageContent";

export default function ChatbotSettingsPage() {
  const {
    settings,
    onSimilarityChange,
    onSimilarityComplete,
    onStyleChange,
    onStyleComplete,
  } = useCompanyChatbotSettings();

  // ❶ 에러만 다시 던지고, 토스트는 슬라이더에서 모두 처리
  const handleSimilarityComplete = async (value: number) => {
    try {
      await onSimilarityComplete(value);
    } catch (err) {
      throw err;
    }
  };

  const handleStyleComplete = async (value: number) => {
    try {
      await onStyleComplete(value);
    } catch (err) {
      throw err;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Toaster position="top-right" />

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
            onChangeComplete={handleSimilarityComplete}
            label={SLIDER_TEXTS.SIMILARITY.LABEL}
            leftLabel={SLIDER_TEXTS.SIMILARITY.LEFT_LABEL}
            rightLabel={SLIDER_TEXTS.SIMILARITY.RIGHT_LABEL}
            tips={SLIDER_TEXTS.SIMILARITY.TIPS}
          />

          <ChatbotSlider
            value={settings.style}
            onChange={onStyleChange}
            onChangeComplete={handleStyleComplete}
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
