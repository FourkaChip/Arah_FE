import React, { memo, useCallback } from 'react';
import { NotificationItem as NotificationItemType, NotificationCategory } from '@/types/notification';

interface NotificationItemProps {
  item: NotificationItemType;
  onClick: (id: string) => void;
}

const CATEGORY_ICONS: Record<NotificationCategory, { icon: string; color: string }> = {
  QnA: { icon: 'fa-solid fa-comment', color: '#4A90E2' },
  Feedback: { icon: 'fa-solid fa-file', color: '#E85D75' }
};

const CategoryIcon = memo<{ category: NotificationCategory }>(({ category }) => {
  const { icon, color } = CATEGORY_ICONS[category];
  
  return (
    <div className={`category-icon ${category.toLowerCase()}-icon`}>
      <i className={icon} style={{ color, fontSize: '24px' }}></i>
    </div>
  );
});

CategoryIcon.displayName = 'CategoryIcon';

const NotificationItem = memo<NotificationItemProps>(({ item, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(item.id);
  }, [item.id, onClick]);

  return (
    <div
      className={`notification-item ${!item.isRead ? 'is-unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-content">
        <span className="unread-dot-container">
          {!item.isRead && <span className="unread-dot">●</span>}
        </span>
        <CategoryIcon category={item.category} />
        <p className="message">{item.message}</p>
      </div>
      <p className="timestamp">{item.timestamp}</p>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
