'use client';

import './Noti.scss';
import { useState } from 'react';
import CustomDropDownForNoti from "@/components/CustomDropdown/CustomDropDownForNoti";
import NotiTabs from "@/components/Tabs/NotiTabs";
import Pagination from "@/components/CustomPagination/Pagination";

export default function AdminNotiPage() {
  const [selectedNoti, setSelectedNoti] = useState('');
  const [currentTab, setCurrentTab] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1); // 페이지 상태 추가
  const totalPages = 15; // 전체 페이지 수 (실제로는 API에서 받아올 값)

  const tabs = ['전체', '읽음', '안읽음'];

  const handleTabChange = (activeTab: string) => {
    setCurrentTab(activeTab);
    setCurrentPage(1); // 탭 변경 시 첫 페이지로 리셋
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 여기에 실제 데이터 로딩 로직 추가 예정
  };

  return (
    <div id="admin-main-page" className="admin-login-page">
      {/* 알림 필터 영역 (드롭다운 + 탭) */}
      <div className="noti-filter-section">
        <div className="filter-controls">
          <CustomDropDownForNoti onChange={setSelectedNoti} />
          <NotiTabs
            tabs={tabs}
            defaultActiveTab="전체"
            onTabChange={handleTabChange}
          />
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* 여기에 필터된 알림 리스트 렌더링할 예정 */}
        {/* <NotificationList tab={currentTab} category={selectedNoti} /> */}
      
      </div>
    </div>
  );
}