'use client';

import React, {memo, useState, useEffect, useCallback, useRef} from 'react';
import {useRouter} from 'next/navigation';
import {useNotificationContext} from '@/contexts/NotificationContext';
import NotificationItem from '@/components/notification/NotificationItem';
import MarkAllReadButton from '@/components/notification/MarkAllReadButton';
import './NotificationModal.scss';
import {NotificationModalProps} from '@/types/notificationModal';

const NotificationModal = memo<NotificationModalProps>(({
                                                            isOpen,
                                                            onClose,
                                                            maxItems = 5,
                                                            buttonRef,
                                                            refreshModalData
                                                        }) => {
    const router = useRouter();
    const [position, setPosition] = useState({top: 0, right: 0});
    const isRefreshingRef = useRef(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        notifications,
        unreadCount,
        handleItemClick,
        handleMarkAllAsRead,
        refreshModalData: contextRefreshModalData
    } = useNotificationContext();

    useEffect(() => {
        if (isOpen && !isRefreshingRef.current) {
            isRefreshingRef.current = true;

            const refreshFunction = contextRefreshModalData || refreshModalData;
            if (refreshFunction) {
                refreshFunction().finally(() => {
                    setTimeout(() => {
                        isRefreshingRef.current = false;
                    }, 1000);
                });
            } else {
                isRefreshingRef.current = false;
            }
        }

        if (!isOpen) {
            isRefreshingRef.current = false;
        }
    }, [isOpen]);

    const unreadNotifications = React.useMemo(() =>
            notifications
                .filter(n => !n.isRead)
                .slice(0, maxItems),
        [notifications, maxItems]
    );

    const actualUnreadCount = React.useMemo(() => {
        const count = notifications.filter(n => !n.isRead).length;
        return count;
    }, [notifications]);

    const displayUnreadCount = unreadCount;
    const isMarkAllReadDisabled = displayUnreadCount === 0;

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

    const handleItemClickWrapper = useCallback(async (id: string) => {
        const clickedNotification = notifications.find(item => item.id === id);
        const wasUnread = clickedNotification && !clickedNotification.isRead;

        handleItemClick(id);

    }, [handleItemClick, notifications]);

    const handleMarkAllAsReadClick = useCallback(async () => {
        handleMarkAllAsRead();
        onClose();
    }, [handleMarkAllAsRead, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="notification-dropdown-backdrop"
            onClick={handleBackdropClick}
            style={{display: isOpen ? 'block' : 'none'}}
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
                            모두 읽음 (
                            <span suppressHydrationWarning>
                                {mounted ? displayUnreadCount : ''}
                            </span>
                            )
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