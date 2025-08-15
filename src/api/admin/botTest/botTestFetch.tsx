// src/api/admin/botTest/botTestFetch.tsx
import { getAccessToken } from '@/utils/tokenStorage';
import type { ChatRequest, ChatResponse } from '@/types/botTest';

export const sendChatMessage = async (message: string): Promise<ChatResponse['result']> => {
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

    return data.result;
  } catch {
    throw new Error('채팅 요청 중 오류가 발생했습니다.');
  }
};
