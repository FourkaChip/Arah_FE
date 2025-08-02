'use client';

import React, { useState, useCallback } from 'react';
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

    const handleTabClick = useCallback((tab: NotificationTab) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    }, [onTabChange]);

    const renderTabContent = useCallback((tab: NotificationTab) => (
        <>
            {tab}
            {tab === '읽지 않음' && unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
            )}
        </>
    ), [unreadCount]);

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