import {NotificationTab} from './notification';

export interface NotiTabsProps {
    tabs: readonly NotificationTab[];
    defaultActiveTab?: NotificationTab;
    onTabChange?: (activeTab: NotificationTab) => void;
    className?: string;
    unreadCount?: number;
}
