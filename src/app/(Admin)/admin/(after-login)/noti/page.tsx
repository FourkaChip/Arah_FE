'use client';

import { useState } from 'react';
import CustomDropDownForNoti from "@/components/CustomDropdown/CustomDropDownForNoti";
import NotiTabs from "@/components/Tabs/NotiTabs";

export default function NotificationPage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedNoti, setSelectedNoti] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentTab, setCurrentTab] = useState('전체');

    const tabs = ['전체', '읽음', '안읽음'];

    const handleTabChange = (activeTab: string) => {
        setCurrentTab(activeTab);
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <CustomDropDownForNoti onChange={setSelectedNoti}/>
                <NotiTabs 
                    tabs={tabs}
                    defaultActiveTab="전체"
                    onTabChange={handleTabChange}
                />
            </div>
        </div>
    );
}