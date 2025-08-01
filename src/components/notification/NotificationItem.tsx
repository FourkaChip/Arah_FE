import React from 'react';
import { NotificationItem as NotificationItemType } from '@/types/notification';

interface NotificationItemProps {
  item: NotificationItemType;
  onClick: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ item, onClick }) => {
  const getCategoryIcon = () => {
    if (item.category === 'QnA') {
      return (
        <div className="category-icon qna-icon">
          <i className="fa-solid fa-comment" style={{ color: '#4A90E2', fontSize: '24px' }}></i>
        </div>
      );
    } else {
      return (
        <div className="category-icon feedback-icon">
          <i className="fa-solid fa-file" style={{ color: '#E85D75', fontSize: '24px' }}></i>
        </div>
      );
    }
  };

  return (
    <div
      className={`notification-item ${!item.isRead ? 'is-unread' : ''}`}
      onClick={() => onClick(item.id)}
    >
      <div className="notification-content">
        <span className="unread-dot-container">
          {!item.isRead && <span className="unread-dot">●</span>}
        </span>
        {getCategoryIcon()}
        <p className="message">{item.message}</p>
      </div>
      <p className="timestamp">{item.timestamp}</p>
    </div>
  );
};

export default NotificationItem;
