import React from 'react';
import { NotificationItem as NotificationItemType } from '@/types/notification';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  items: NotificationItemType[];
  onItemClick: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ items, onItemClick }) => {
  return (
    <div className="notification-list">
      {items.length > 0 ? (
        items.map((item) => (
          <NotificationItem key={item.id} item={item} onClick={onItemClick} />
        ))
      ) : (
        <div className="empty-notification-message">
          <p>표시할 알림이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
