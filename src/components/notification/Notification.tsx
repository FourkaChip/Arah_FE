'use client';

import React, {useEffect} from 'react';
import NotiTabs from "@/components/tabs/NotiTabs";
import Pagination from "@/components/customPagination/Pagination";
import NotificationList from './NotificationList';
import MarkAllReadButton from './MarkAllReadButton';
import {useNotificationContext} from '@/contexts/NotificationContext';
import {NOTIFICATION_TABS, NotificationProps} from '@/types/notification.d';
import './Notification.scss';
import ModalDefault from '@/components/modal/ModalDefault/ModalDefault';


export default function Notification({
                                         itemsPerPage = 5,
                                         className = ""
                                     }: NotificationProps) {

    const {
        paginatedNotifications,
        filters,
        currentPage,
        totalPages,
        unreadCount,
        handleTabChange,
        handlePageChange,
        handleItemClick,
        handleMarkAllAsRead,
        errorMessage,
        setErrorMessage,
    } = useNotificationContext();

    const actualUnreadCount = React.useMemo(() => {
        return paginatedNotifications.filter(n => !n.isRead).length;
    }, [paginatedNotifications]);

    const displayUnreadCount = unreadCount;
    const isMarkAllReadDisabled = displayUnreadCount === 0;

    return (
        <div className={`notification-container ${className}`}>

            <div className="noti-filter-section">
                <div className="filter-controls">
                    <div className="filter-left">
                        <NotiTabs
                            tabs={NOTIFICATION_TABS}
                            defaultActiveTab="전체"
                            onTabChange={handleTabChange}
                            unreadCount={unreadCount}
                        />
                    </div>
                    <div className="filter-right">
                        <MarkAllReadButton
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkAllReadDisabled}
                        />
                    </div>
                </div>
            </div>

            <div className="notification-content-area">
                <NotificationList items={paginatedNotifications} onItemClick={handleItemClick}/>
            </div>

            <div className="pagination-area">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
            {errorMessage && (
                <ModalDefault
                    type="default"
                    label="알림 오류"
                    onClose={() => setErrorMessage(null)}
                    errorMessages={[errorMessage]}
                />
            )}
        </div>
    );
}