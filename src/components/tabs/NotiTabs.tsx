'use client';

import React, {useState, useCallback, useEffect} from 'react';
import {NotiTabsProps} from '@/types/notiTabs';
import {NotificationTab} from '@/types/notification';
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
    const [displayUnreadCount, setDisplayUnreadCount] = useState(0);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            setDisplayUnreadCount(unreadCount);
        }
    }, [unreadCount, isClient]);

    const handleTabClick = useCallback((tab: NotificationTab) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    }, [onTabChange]);

    const renderTabContent = useCallback((tab: NotificationTab) => {
        const shouldShowBadge = isClient && tab === '읽지 않음' && displayUnreadCount > 0;

        return (
            <>
                {tab}
                {shouldShowBadge && (
                    <span className="unread-badge" suppressHydrationWarning>
                        {displayUnreadCount}
                    </span>
                )}
            </>
        );
    }, [displayUnreadCount, isClient]);

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
