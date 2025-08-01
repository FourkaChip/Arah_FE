'use client';

import React, { memo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationContext } from '@/contexts/NotificationContext';
import NotificationItem from '@/components/notification/NotificationItem';
import MarkAllReadButton from '@/components/notification/MarkAllReadButton';
import './NotificationModal.scss';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxItems?: number;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const NotificationModal = memo<NotificationModalProps>(({ 
  isOpen, 
  onClose, 
  maxItems = 5,
  buttonRef 
}) => {
  const router = useRouter();
  const [position, setPosition] = useState({ top: 0, right: 0 });
  
  const {
    notifications,
    unreadCount,
    handleItemClick,
    handleMarkAllAsRead
  } = useNotificationContext();

  // 안 읽은 알림만 필터링하여 최대 개수만큼 가져오기
  const unreadNotifications = React.useMemo(() => 
    notifications
      .filter(n => !n.isRead)
      .slice(0, maxItems),
    [notifications, maxItems]
  );

  // 버튼 위치 계산
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.bottom + 8, // 버튼 아래쪽에 8px 간격
        right: window.innerWidth - buttonRect.right // 오른쪽 정렬
      });
    }
  }, [isOpen, buttonRef]);

  const handleViewAllClick = () => {
    onClose();
    router.push('/admin/noti');
  };

  const handleMarkAllAsReadClick = () => {
    handleMarkAllAsRead();
  };

  const handleItemClickWrapper = (id: string) => {
    handleItemClick(id);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown-backdrop" onClick={handleBackdropClick}>
      <div 
        className="notification-dropdown"
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          right: `${position.right}px`
        }}
      >
        <div className="dropdown-header">
          <h3 className="dropdown-title">알림</h3>
          <div className="dropdown-actions">
            <MarkAllReadButton 
              onClick={handleMarkAllAsReadClick}
              disabled={unreadCount === 0}
            />
            <button 
              className="close-button"
              onClick={onClose}
              aria-label="닫기"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        <div className="dropdown-content">
          {unreadNotifications.length > 0 ? (
            <div className="notification-list">
              {unreadNotifications.map((item) => (
                <NotificationItem 
                  key={item.id} 
                  item={item} 
                  onClick={handleItemClickWrapper}
                />
              ))}
            </div>
          ) : (
            <div className="empty-notification-message">
              <p>새로운 알림이 없습니다.</p>
            </div>
          )}
        </div>

        <div className="dropdown-footer">
          <button 
            className="view-all-button"
            onClick={handleViewAllClick}
          >
            알림 전체 보기
          </button>
        </div>
      </div>
    </div>
  );
});

NotificationModal.displayName = 'NotificationModal';

export default NotificationModal;