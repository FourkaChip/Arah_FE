'use client';

import React from 'react';
import CustomDropDownForNoti from "@/components/customDropdown/CustomDropDownForNoti";
import NotiTabs from "@/components/tabs/NotiTabs";
import Pagination from "@/components/customPagination/Pagination";
import NotificationList from './NotificationList';
import MarkAllReadButton from './MarkAllReadButton';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { NOTIFICATION_TABS } from '@/types/notification.d';
import './Notification.scss';

interface NotificationProps {
  itemsPerPage?: number;
  className?: string;
}

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
    handleCategoryChange,
    handlePageChange,
    handleItemClick,
    handleMarkAllAsRead,
  } = useNotificationContext();

  return (
    <div className={`notification-container ${className}`}>
      
      <div className="noti-filter-section">
        <div className="filter-controls">
          <div className="filter-left">
            <CustomDropDownForNoti onChange={handleCategoryChange} />
            <NotiTabs
              tabs={NOTIFICATION_TABS}
              defaultActiveTab="전체"
              onTabChange={handleTabChange}
              unreadCount={unreadCount}
            />
          </div>
          <div className="filter-right">
            <MarkAllReadButton onClick={handleMarkAllAsRead} />
          </div>
        </div>
      </div>
      
      <div className="notification-content-area">
        <NotificationList items={paginatedNotifications} onItemClick={handleItemClick} />
      </div>

      <div className="pagination-area">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}