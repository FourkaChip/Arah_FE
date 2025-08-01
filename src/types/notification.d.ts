export interface NotificationItem {
  id: string;
  category: 'QnA' | 'Feedback';
  message: string;
  isRead: boolean;
  timestamp: string;
  createdAt: Date; // 정렬을 위한 실제 날짜
}
