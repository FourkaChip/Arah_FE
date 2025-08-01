'use client';

import { useState, useEffect } from 'react';
import CustomDropDownForNoti from "@/components/CustomDropdown/CustomDropDownForNoti";
import NotiTabs from "@/components/Tabs/NotiTabs";
import Pagination from "@/components/CustomPagination/Pagination";
import NotificationList from './NotificationList';
import { dummyNotifications } from '@/constants/dummydata/notifications';
import { NotificationItem } from '@/types/notification';
import './Notification.scss';

interface NotificationProps {
  itemsPerPage?: number;
  showTitle?: boolean;
  className?: string;
}

export default function Notification({ 
  itemsPerPage = 5, 
  showTitle = false,
  className = ""
}: NotificationProps) {
  // 알림을 시간순으로 정렬 (최신순)
  const sortedNotifications = [...dummyNotifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(sortedNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentTab, setCurrentTab] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let result = notifications;

    // 탭 필터링 ('전체', '읽음', '안읽음')
    if (currentTab === '읽음') {
      result = result.filter(n => n.isRead);
    } else if (currentTab === '안읽음') {
      result = result.filter(n => !n.isRead);
    }

    // 카테고리 필터링 ('QnA', 'Feedback')
    if (selectedCategory !== '전체') {
      result = result.filter(n => n.category === selectedCategory);
    }

    setFilteredNotifications(result);
  }, [notifications, currentTab, selectedCategory]);

  // 탭이나 카테고리가 변경될 때만 페이지를 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, selectedCategory]);

  const handleItemClick = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, isRead: true } : n));
      // 읽음 처리 후에도 시간순 정렬 유지
      return updated.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  };

  const handleTabChange = (activeTab: string) => {
    setCurrentTab(activeTab);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 페이지네이션을 위한 현재 페이지의 알림 목록 계산
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  // 현재 페이지에 알림이 없고 이전 페이지가 있다면 이전 페이지로 이동
  useEffect(() => {
    if (filteredNotifications.length > 0 && paginatedNotifications.length === 0 && currentPage > 1) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [filteredNotifications.length, paginatedNotifications.length, currentPage, totalPages]);

  const tabs = ['전체', '읽음', '안읽음'];

  return (
    <div className={`notification-container ${className}`}>
      
      <div className="noti-filter-section">
        <div className="filter-controls">
          <CustomDropDownForNoti onChange={handleCategoryChange} />
          <NotiTabs
            tabs={tabs}
            defaultActiveTab="전체"
            onTabChange={handleTabChange}
          />
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