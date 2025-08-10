// 챗봇 설정 관련 API 연결 함수들입니다.

import { authorizedFetch } from "@/api/auth/authorizedFetch";
import type { SliderSettings } from "@/types/slider";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/levels`;

let chatbotSettingsCache: SliderSettings | null = null;
let chatbotSettingsPromise: Promise<SliderSettings> | null = null;
let chatbotSettingsCacheTime: number = 0;
const CHATBOT_SETTINGS_CACHE_DURATION = 2 * 60 * 1000;

// 회사 챗봇 설정 값(유사도, 스타일) 조회
export const getCompanyChatbotSettings = async (): Promise<SliderSettings> => {
  const now = Date.now();

  if (
    chatbotSettingsCache &&
    (now - chatbotSettingsCacheTime) < CHATBOT_SETTINGS_CACHE_DURATION
  ) {
    return chatbotSettingsCache;
  }

  if (chatbotSettingsPromise) {
    return await chatbotSettingsPromise;
  }

  chatbotSettingsPromise = (async () => {
    const res = await authorizedFetch(BASE_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      chatbotSettingsPromise = null;
      throw new Error(`설정값 조회에 실패했습니다. (HTTP ${res.status})`);
    }

    const data = await res.json();
    const { thinkLevel, speechLevel } = data.result;
    const settings: SliderSettings = {
      similarity: speechLevel,
      style: thinkLevel,
    };

    chatbotSettingsCache = settings;
    chatbotSettingsCacheTime = Date.now();
    chatbotSettingsPromise = null;
    return settings;
  })();

  return await chatbotSettingsPromise;
};

export const clearCompanyChatbotSettingsCache = () => {
  chatbotSettingsCache = null;
  chatbotSettingsPromise = null;
  chatbotSettingsCacheTime = 0;
};

// 회사 챗봇 설정 값(유사도, 스타일) 업데이트
export const updateCompanyChatbotSettings = async (
  settings: SliderSettings
): Promise<void> => {
  const body = {
    thinkLevel: settings.style,
    speechLevel: settings.similarity,
  };

  const res = await authorizedFetch(BASE_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      msg = errBody.message || msg;
    } catch {
    }
    throw new Error(`설정값 업데이트에 실패했습니다. (${msg})`);
  }

  const data = await res.json();
  if (data.success !== true) {
    throw new Error(`설정값 업데이트에 실패했습니다. (${data.message})`);
  }

  clearCompanyChatbotSettingsCache();

};
