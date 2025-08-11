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

  const [originalSettings, setOriginalSettings] = useState<SliderSettings>({
    similarity: 5,
    style: 5,
  });

  useEffect(() => {
    getCompanyChatbotSettings()
      .then((data) => {
        setSettings(data);
        setOriginalSettings(data);
      })
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

  const handleAfterChange = useCallback(
    (field: "similarity" | "style") =>
      async (value: number) => {
        if (originalSettings[field] === value) {
          const error = new Error('NO_CHANGE');
          throw error;
        }

        const updated = { ...originalSettings, [field]: value } as SliderSettings;

        try {
          await updateCompanyChatbotSettings(updated);
          setOriginalSettings((prev) => ({ ...prev, [field]: value }));
          setSettings((prev) => ({ ...prev, [field]: value }));
        } catch (err) {
          setSettings(originalSettings);
          throw err;
        }
      },
    [originalSettings]
  );

  return {
    settings,
    onSimilarityChange: handleChange("similarity"),
    onSimilarityComplete: handleAfterChange("similarity"),
    onStyleChange: handleChange("style"),
    onStyleComplete: handleAfterChange("style"),
  };
}
