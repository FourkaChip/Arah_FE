import React from 'react';
import './Noti.scss';
import Notification from '@/components/notification/Notification';
import ProtectedRoute from "@/components/ProtectedRoute";
import {NotificationProvider} from '@/contexts/NotificationContext';

const PAGE_CONFIG = {
    ITEMS_PER_PAGE: 5,
    TITLE: '알림',
    DESCRIPTION: '사용자 피드백에 대한 수신 알림을 제공합니다.'
} as const;

export default function AdminNotiPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <NotificationProvider itemsPerPage={PAGE_CONFIG.ITEMS_PER_PAGE}>
                <div id="admin-main-page">
                    <div className="page-header">
                        <div className="admin-noti-page-wrapper">
                            <h1 className="noti-title">{PAGE_CONFIG.TITLE}</h1>
                            <p className="noti-description">{PAGE_CONFIG.DESCRIPTION}</p>
                        </div>
                    </div>

                    <Notification itemsPerPage={PAGE_CONFIG.ITEMS_PER_PAGE}/>
                </div>
            </NotificationProvider>
        </ProtectedRoute>
    );
}
