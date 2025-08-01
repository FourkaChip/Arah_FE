'use client';

import { useState } from 'react';
import { NotiTabsProps } from '@/types/notiTabs';
import './NotiTabs.scss';

export default function NotiTabs({ 
    tabs, 
    defaultActiveTab, 
    onTabChange,
    className = '',
    unreadCount = 0
}: NotiTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        if (onTabChange) {
            onTabChange(tab);
        }
    };

    return (
        <div className={`tabs is-medium ${className}`}>
            <ul>
                {tabs.map((tab) => (
                    <li 
                        key={tab}
                        className={activeTab === tab ? 'is-active' : ''}
                    >
                        <a onClick={() => handleTabClick(tab)}>
                            {tab}
                            {tab === '안읽음' && unreadCount > 0 && (
                                <span className="unread-badge">{unreadCount}</span>
                            )}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
} 