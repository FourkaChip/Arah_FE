// src/api/admin/botTest/botTestFetch.tsx
import { getAccessToken } from '@/utils/tokenStorage';
import type { ChatRequest, ChatResponse } from '@/types/botTest';

/**
 * 챗봇에게 메시지를 전송하고 응답을 받는 함수
 * @param message - 전송할 메시지
 * @returns 챗봇의 응답 메시지
 * @throws {Error} API 호출 실패시 에러
 */
export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const requestBody: ChatRequest = { message };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '채팅 요청에 실패했습니다.');
    }

    return data.result.response_content;
  } catch {
    throw new Error('채팅 요청 중 오류가 발생했습니다.');
  }
};
