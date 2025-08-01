import React, { memo } from 'react';
import { NotificationItem as NotificationItemType } from '@/types/notification';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  items: NotificationItemType[];
  onItemClick: (id: string) => void;
}

const EmptyMessage = memo(() => (
  <div className="empty-notification-message">
    <p>표시할 알림이 없습니다.</p>
  </div>
));

EmptyMessage.displayName = 'EmptyMessage';

const NotificationList = memo<NotificationListProps>(({ items, onItemClick }) => {
  if (items.length === 0) {
    return <EmptyMessage />;
  }

  return (
    <div className="notification-list">
      {items.map((item) => (
        <NotificationItem 
          key={item.id} 
          item={item} 
          onClick={onItemClick} 
        />
      ))}
    </div>
  );
});

NotificationList.displayName = 'NotificationList';

export default NotificationList;
