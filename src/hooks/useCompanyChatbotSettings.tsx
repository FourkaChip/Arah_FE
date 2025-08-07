// src/hooks/useCompanyChatbotSettings.tsx
import { useState, useEffect, useCallback } from "react";
import {
  getCompanyChatbotSettings,
  updateCompanyChatbotSettings,
} from "@/api/admin/ara/araFetch";
import type { SliderSettings } from "@/types/slider";

export function useCompanyChatbotSettings() {
  const [settings, setSettings] = useState<SliderSettings>({
    similarity: 5,
    style: 5,
  });

  // 초기 조회
  useEffect(() => {
    getCompanyChatbotSettings()
      .then(setSettings)
      .catch((err) => console.error("[초기값 로딩 실패]", err));
  }, []);

  // 로컬 상태 변경 핸들러
  const handleChange = useCallback(
    (field: "similarity" | "style") =>
      (value: number) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
      },
    []
  );

  // 변경 완료 시 서버 업데이트
  const handleAfterChange = useCallback(
    (field: "similarity" | "style") =>
      (value: number) => {
        const updated = { ...settings, [field]: value } as SliderSettings;
        updateCompanyChatbotSettings(updated)
          .then(() => console.log(`[${field}] 업데이트 성공`, value))
          .catch((err) =>
            console.error(`[${field}] 업데이트 실패]`, err)
          );
      },
    [settings]
  );

  return {
    settings,
    onSimilarityChange: handleChange("similarity"),
    onSimilarityComplete: handleAfterChange("similarity"),
    onStyleChange: handleChange("style"),
    onStyleComplete: handleAfterChange("style"),
  };
}