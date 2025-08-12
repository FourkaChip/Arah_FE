'use client';

import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationContext } from '@/contexts/NotificationContext';
import NotificationItem from '@/components/notification/NotificationItem';
import MarkAllReadButton from '@/components/notification/MarkAllReadButton';
import './NotificationModal.scss';
import { NotificationModalProps } from '@/types/notificationModal';

const NotificationModal = memo<NotificationModalProps>(({ 
  isOpen, 
  onClose, 
  maxItems = 5,
  buttonRef,
  refreshModalData
}) => {
  const router = useRouter();
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const isRefreshingRef = useRef(false); // 중복 호출 방지

  const {
    notifications,
    unreadCount,
    handleItemClick,
    handleMarkAllAsRead,
    refreshModalData: contextRefreshModalData
  } = useNotificationContext();

  // 모달이 열릴 때만 한 번 호출
  useEffect(() => {
    if (isOpen && !isRefreshingRef.current) {
      console.log('📝 모달 열림 - 최신 알림 데이터 조회 (한 번만)');
      isRefreshingRef.current = true;

      const refreshFunction = contextRefreshModalData || refreshModalData;
      if (refreshFunction) {
        refreshFunction().finally(() => {
          // 요청 완료 후 다시 호출 가능하도록 설정
          setTimeout(() => {
            isRefreshingRef.current = false;
          }, 1000); // 1초 후 ���시 호출 가능
        });
      } else {
        console.warn('⚠️ 모달 새로고침 함수가 제공되지 않았습니다.');
        isRefreshingRef.current = false;
      }
    }

    // 모달이 닫히면 플래그 리셋
    if (!isOpen) {
      isRefreshingRef.current = false;
    }
  }, [isOpen]); // isOpen만 의존성으로 설정

  const unreadNotifications = React.useMemo(() =>
    notifications
      .filter(n => !n.isRead)
      .slice(0, maxItems),
    [notifications, maxItems]
  );

  // 실제 읽지 않은 알림 개수 계산
  const actualUnreadCount = React.useMemo(() => {
    const count = notifications.filter(n => !n.isRead).length;
    console.log('🔍 실제 읽지 않은 알림 개수 계산:', {
      totalNotifications: notifications.length,
      actualUnreadCount: count,
      contextUnreadCount: unreadCount,
      unreadNotificationsLength: unreadNotifications.length
    });
    return count;
  }, [notifications, unreadCount, unreadNotifications.length]);

  // 모두 읽음 버튼 활성화 조건 - 실제 읽지 않은 알림이 있으면 활성화
  const isMarkAllReadDisabled = actualUnreadCount === 0 && unreadNotifications.length === 0;

  console.log('🔍 모두 읽음 버튼 상태:', {
    unreadCount,
    actualUnreadCount,
    unreadNotificationsLength: unreadNotifications.length,
    isDisabled: isMarkAllReadDisabled
  });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right
      });
    }
  }, [isOpen, buttonRef]);

  const handleViewAllClick = () => {
    onClose();
    router.push('/admin/noti');
  };

  // 모든 알림 읽음 처리 후 모달 닫기
  const handleMarkAllAsReadClick = useCallback(async () => {
    console.log('📝 모달에서 모든 알��� 읽음 처리 시작');
    await handleMarkAllAsRead();
    onClose();
  }, [handleMarkAllAsRead, onClose]);

  // 개별 알림 클릭 처리 (모달은 닫지 않음)
  const handleItemClickWrapper = useCallback(async (id: string) => {
    console.log('📝 모달에서 알림 클릭:', id);
    await handleItemClick(id);
    // 개별 클릭 후에는 별도 새로고침하지 않음 (handleItemClick에서 처리됨)
  }, [handleItemClick]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="notification-dropdown-backdrop"
      onClick={handleBackdropClick}
      style={{ display: isOpen ? 'block' : 'none' }}
    >
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
              disabled={isMarkAllReadDisabled}
            >
              모두 읽음 ({Math.max(unreadCount, actualUnreadCount)})
            </MarkAllReadButton>
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