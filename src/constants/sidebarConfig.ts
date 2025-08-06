// 관리자용 메뉴 구성
import {MenuItem} from "@/types/sidebar";

export const ADMIN_MENU_ITEMS: MenuItem[] = [
    {
        id: 'dataset',
        label: '데이터셋 관리',
        icon: 'fa-solid fa-database',
        subItems: [
            {id: 'manage-dataset', label: '데이터셋'},
            {id: 'faq', label: 'FAQ'},
        ],
    },
    {id: 'inquiry', label: '피드백', icon: 'fa-solid fa-comments'},
    {id: 'statistics', label: '통계', icon: 'fa-solid fa-chart-simple'},
    {id: 'alarm', label: '알림', icon: 'fa-solid fa-bell'},
    {id: 'chatbot', label: '챗봇 설정', icon: 'fa-solid fa-robot'},
];

// 마스터용 메뉴 구성
export const MASTER_MENU_ITEMS: MenuItem[] = [
    {id: 'admin-manage', label: '관리자 관리', icon: 'fa-solid fa-users-gear'},
    {id: 'company-config', label: '기업 설정', icon: 'fa-solid fa-gear'},
];

// 메뉴 ID와 실제 경로 매핑
export const MENU_ROUTES = {
    'manage-dataset': '/admin/manage',
    'faq': '/admin/faq',
    'inquiry': '/admin/dataset',
    'statistics': '/admin/analyze',
    'alarm': '/admin/noti',
    'chatbot': '/admin/ara',
    'admin-manage': '/master/manage',
    'company-config': '/master/dept',
} as const;