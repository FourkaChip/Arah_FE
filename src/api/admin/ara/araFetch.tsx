// src/api/admin/araFetch.tsx

import { authorizedFetch } from "@/api/auth/authorizedFetch";
import type { SliderSettings } from "@/types/slider";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/companies/levels`;

// 회사 챗봇 설정 값(유사도, 스타일) 조회
export const getCompanyChatbotSettings = async (): Promise<SliderSettings> => {
  const res = await authorizedFetch(BASE_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`설정값 조회에 실패했습니다. (HTTP ${res.status})`);
  }

  const data = await res.json();
  console.log("설정값 조회 성공", data);

  const { thinkLevel, speechLevel } = data.result;
  return {
    similarity: speechLevel,
    style: thinkLevel,
  };
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

  console.log("설정값 업데이트 성공", data);
};