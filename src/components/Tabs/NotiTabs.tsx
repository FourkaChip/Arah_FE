'use client';

import { useState } from 'react';
import './NotiTabs.scss';

interface NotiTabsProps {
    tabs: string[];
    defaultActiveTab?: string;
    onTabChange?: (activeTab: string) => void;
    className?: string;
}

export default function NotiTabs({ 
    tabs, 
    defaultActiveTab, 
    onTabChange,
    className = '' 
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
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
} 