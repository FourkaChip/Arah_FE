'use client';

import Image from "next/image";
import './Noti.scss';
import { useState } from 'react';

import ModalUploadTrigger from "@/components/utils/ModalTrigger/ModalUploadTrigger";
import ModalFAQTrigger from "@/components/utils/ModalTrigger/ModalFAQTrigger";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";
import CustomDropDownForNoti from "@/components/CustomDropdown/CustomDropDownForNoti";
import NotiTabs from "@/components/Tabs/NotiTabs";

export default function AdminNotiPage() {
  const [selectedNoti, setSelectedNoti] = useState('');
  const [currentTab, setCurrentTab] = useState('전체');

  const tabs = ['전체', '읽음', '안읽음'];

  const handleTabChange = (activeTab: string) => {
    setCurrentTab(activeTab);
  };

  return (
    <div id="admin-main-page" className="admin-login-page">
    

      {/* 알림 필터 영역 (드롭다운 + 탭) */}
      <div className="noti-filter-section" style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <CustomDropDownForNoti onChange={setSelectedNoti} />
          <NotiTabs
            tabs={tabs}
            defaultActiveTab="전체"
            onTabChange={handleTabChange}
          />
        </div>

        {/* 여기에 필터된 알림 리스트 렌더링할 예정 */}
        {/* <NotificationList tab={currentTab} category={selectedNoti} /> */}
      </div>
    </div>
  );
}