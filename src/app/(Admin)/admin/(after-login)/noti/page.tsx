import React from 'react';
import './Noti.scss';
import Notification from '@/components/notification/Notification';


/** 페이지의 제목, 설명, 아이템 개수 등을 상수 객체 `PAGE_CONFIG`로 관리하도록 리팩토링 하였습니다. 
추후 다른 페이지에서도 수정 예정입니다. */

const PAGE_CONFIG = {
  ITEMS_PER_PAGE: 5,
  TITLE: '알림',
  DESCRIPTION: '사용자 피드백에 대한 수신 알림을 제공합니다.'
} as const;

export default function AdminNotiPage() {
  return (
    <div id="admin-main-page">
      <div className="page-header">
        <div className="admin-noti-page-wrapper">
          <h1 className="noti-title">{PAGE_CONFIG.TITLE}</h1>
          <p className="noti-description">{PAGE_CONFIG.DESCRIPTION}</p>
        </div>
      </div>
      
      <Notification itemsPerPage={PAGE_CONFIG.ITEMS_PER_PAGE} />
    </div>
  );
}
