export interface NotiTabsProps {
    tabs: string[];
    defaultActiveTab?: string;
    onTabChange?: (activeTab: string) => void;
    className?: string;
    unreadCount?: number;
}
