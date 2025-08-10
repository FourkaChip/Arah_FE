// 챗봇 슬라이더 값 수정과 관련된 훅입니다.
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

  useEffect(() => {
    getCompanyChatbotSettings()
      .then(setSettings)
      .catch((err) => {
        throw err;
      });
  }, []);

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
      async (value: number) => {
        const updated = { ...settings, [field]: value } as SliderSettings;

        try {
          await updateCompanyChatbotSettings(updated);
        } catch (err) {
          throw err;
        }
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
