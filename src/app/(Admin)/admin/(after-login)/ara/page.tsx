// 챗봇 설정 페이지입니다.
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
    originalSettings,
    onSimilarityChange,
    onSimilarityComplete,
    onStyleChange,
    onStyleComplete,
  } = useCompanyChatbotSettings();

  const handleSimilarityComplete = async (value: number) => {
    await onSimilarityComplete(value);
  };

  const handleStyleComplete = async (value: number) => {
    await onStyleComplete(value);
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
            originalValue={originalSettings.similarity}
            label={SLIDER_TEXTS.SIMILARITY.LABEL}
            leftLabel={SLIDER_TEXTS.SIMILARITY.LEFT_LABEL}
            rightLabel={SLIDER_TEXTS.SIMILARITY.RIGHT_LABEL}
            tips={SLIDER_TEXTS.SIMILARITY.TIPS}
          />

          <ChatbotSlider
            value={settings.style}
            onChange={onStyleChange}
            onChangeComplete={handleStyleComplete}
            originalValue={originalSettings.style}
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
