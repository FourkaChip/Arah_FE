// src/api/admin/botTest/botTestFetch.tsx
import { getAccessToken } from '@/utils/tokenStorage';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  timestamp: string;
  success: boolean;
  message: string;
  code: number;
  result: {
    request_content: string;
    response_content: string;
    meta_result: unknown[];
  };
}

export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '채팅 요청에 실패했습니다.');
    }

    return data.result.response_content;
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('채팅 요청 중 오류가 발생했습니다.');
  }
};