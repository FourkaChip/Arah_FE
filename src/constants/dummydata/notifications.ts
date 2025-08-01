import { NotificationItem } from '@/types/notification';

export const dummyNotifications: NotificationItem[] = [
  {
    id: '1',
    category: 'QnA',
    message: '[QnA] 출장비 정산 양식은 어디에 있나요?',
    isRead: false,
    timestamp: '27분 전',
    createdAt: new Date(Date.now() - 27 * 60 * 1000), // 27분 전
  },
  {
    id: '2',
    category: 'QnA',
    message: '[QnA] 명함 발급은 어디서 하나요?',
    isRead: true,
    timestamp: '1시간 전',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1시간 전
  },
  {
    id: '3',
    category: 'Feedback',
    message: '[FeedBack] 데이터 업데이트가 필요합니다.',
    isRead: true,
    timestamp: '2시간 전',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
  },
  {
    id: '4',
    category: 'QnA',
    message: '[QnA] 연차 신청 후 승인은 어떻게 하나요?',
    isRead: true,
    timestamp: '3시간 전',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
  },
  {
    id: '5',
    category: 'Feedback',
    message: '[FeedBack] 일부 키워드를 정확히 입력하지 않으면 답변을 찾 찾습니다.',
    isRead: true,
    timestamp: '1일 전',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
  },
  {
    id: '6',
    category: 'QnA',
    message: '[QnA] 회의실 예약은 어떻게 하나요?',
    isRead: true,
    timestamp: '2일 전',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
  },
  {
    id: '7',
    category: 'Feedback',
    message: '[FeedBack] 검색 기능이 개선되었으면 좋겠습니다.',
    isRead: false,
    timestamp: '3일 전',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
  },
  {
    id: '8',
    category: 'QnA',
    message: '[QnA] 휴가 신청서는 어디서 작성하나요?',
    isRead: true,
    timestamp: '5일 전',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
  },
  // ===== 추가 더미 데이터 9 ~ 60 =====
  ...Array.from({ length: 52 }, (_, idx) => {
    const id = idx + 9; // 9 ~ 60
    const isOdd = id % 2 === 1;
    const category = isOdd ? 'QnA' : 'Feedback';
    const isRead = id % 3 === 0; // 임의 규칙: 3의 배수이면 읽음 처리

    // 시간을 순차적으로 생성 (최신부터 과거 순으로)
    const minutesAgo = id * 15 + Math.floor(Math.random() * 10); // 15분씩 간격으로 + 랜덤 10분
    const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);
    
    let timestamp: string;
    if (minutesAgo < 60) {
      timestamp = `${minutesAgo}분 전`;
    } else if (minutesAgo < 24 * 60) {
      timestamp = `${Math.floor(minutesAgo / 60)}시간 전`;
    } else {
      timestamp = `${Math.floor(minutesAgo / (24 * 60))}일 전`;
    }

    const qnaMessages = [
      '[QnA] 사내 식당 메뉴는 어디서 확인하나요?',
      '[QnA] 프린터 사용법을 알고 싶습니다.',
      '[QnA] 주차장 이용 방법이 궁금합니다.',
      '[QnA] 복리후생 제도에 대해 알려주세요.',
      '[QnA] 교육 프로그램 신청은 어떻게 하나요?',
      '[QnA] 업무용 노트북 대여가 가능한가요?',
      '[QnA] 재택근무 신청 절차를 알려주세요.',
      '[QnA] 경조사 휴가는 어떻게 신청하나요?',
      '[QnA] 사내 동호회 가입 방법이 궁금합니다.',
      '[QnA] 건강검진 일정을 확인하고 싶어요.',
    ];

    const feedbackMessages = [
      '[FeedBack] 챗봇 응답 속도가 느려요.',
      '[FeedBack] 더 다양한 질문에 답변해주세요.',
      '[FeedBack] 검색 결과가 정확하지 않아요.',
      '[FeedBack] 인터페이스가 개선되었으면 좋겠어요.',
      '[FeedBack] 모바일 버전도 지원해주세요.',
      '[FeedBack] 음성 인식 기능을 추가해주세요.',
      '[FeedBack] 자주 묻는 질문을 정리해주세요.',
      '[FeedBack] 답변의 정확도를 높여주세요.',
      '[FeedBack] 다국어 지원이 필요합니다.',
      '[FeedBack] 사용자 매뉴얼이 있으면 좋겠어요.',
    ];

    const messages = category === 'QnA' ? qnaMessages : feedbackMessages;
    const message = messages[idx % messages.length];

    return {
      id: id.toString(),
      category,
      message,
      isRead,
      timestamp,
      createdAt,
    } as NotificationItem;
  }),
] as unknown as NotificationItem[];
