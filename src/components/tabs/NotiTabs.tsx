'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { NotiTabsProps } from '@/types/notiTabs';
import { NotificationTab } from '@/types/notification';
import './NotiTabs.scss';

export default function NotiTabs({ 
    tabs, 
    defaultActiveTab, 
    onTabChange,
    className = '',
    unreadCount = 0
}: NotiTabsProps) {
    const [activeTab, setActiveTab] = useState<NotificationTab>(defaultActiveTab || tabs[0]);
    const [isClient, setIsClient] = useState(false);

    // 클라이언트 마운트 확인
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        console.log('📊 NotiTabs unreadCount 업데이트:', unreadCount);
    }, [unreadCount]);

    const handleTabClick = useCallback((tab: NotificationTab) => {
        console.log('🎯 탭 클릭:', tab);
        setActiveTab(tab);
        onTabChange?.(tab);
    }, [onTabChange]);

    const renderTabContent = useCallback((tab: NotificationTab) => {
        // 클라이언트에서만 배지 표시 (hydration 에러 방지)
        const shouldShowBadge = isClient && tab === '읽지 않음' && unreadCount > 0;
        console.log('🎨 탭 렌더링:', { tab, unreadCount, shouldShowBadge, isClient });

        return (
            <>
                {tab}
                {shouldShowBadge && (
                    <span className="unread-badge">{unreadCount}</span>
                )}
            </>
        );
    }, [unreadCount, isClient]);

    console.log('🏷️ NotiTabs 렌더링:', { activeTab, unreadCount, tabs, isClient });

    return (
        <div className={`tabs is-medium ${className}`}>
            <ul>
                {tabs.map((tab) => (
                    <li 
                        key={tab}
                        className={activeTab === tab ? 'is-active' : ''}
                    >
                        <a onClick={() => handleTabClick(tab)}>
                            {renderTabContent(tab)}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
