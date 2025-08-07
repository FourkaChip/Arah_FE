// src/constants/dummydata/DummyBotTest.tsx
export interface Message {
  id: number;
  sender: 'bot' | 'user';
  text: string;
}

export const botDummyMessages: Message[] = [
  { id: 1, sender: 'bot', text: '안녕하세요! FourKa 챗봇입니다. 무엇을 도와드릴까요?' },
  { id: 2, sender: 'user', text: '인사담당과의 총 사원수를 알려줘' },
  { id: 3, sender: 'bot', text: '네, 알려드릴게요.' },
  { id: 4, sender: 'bot', text: '2025년 하반기 기준 인사담당과의 총 모집 사원 수는 10명으로, 경력직 3명, 신입사원 7명을 추가로 모집 중입니다.' },
];