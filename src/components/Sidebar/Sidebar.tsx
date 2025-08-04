"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from "next/navigation";
import './Sidebar.scss';
import { MenuItem, SubMenuItem, SidebarProps } from '@/types/sidebar';

// 관리자용 메뉴 구성
const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dataset',
    label: '데이터셋 관리',
    icon: 'fa-solid fa-database',
    subItems: [
      { id: 'manage-dataset', label: '데이터셋' },
      { id: 'faq', label: 'FAQ' },
    ],
  },
  { id: 'inquiry', label: '피드백', icon: 'fa-solid fa-comments' },
  { id: 'statistics', label: '통계', icon: 'fa-solid fa-chart-simple' },
  { id: 'alarm', label: '알림', icon: 'fa-solid fa-bell' },
  { id: 'chatbot', label: '챗봇 설정', icon: 'fa-solid fa-robot' },
];

// 마스터용 메뉴 구성
const MASTER_MENU_ITEMS: MenuItem[] = [
  { id: 'admin-manage', label: '관리자 관리', icon: 'fa-solid fa-users-gear' },
  { id: 'company-config', label: '기업 설정', icon: 'fa-solid fa-gear' },
];

// 메뉴 ID와 실제 경로 매핑
const MENU_ROUTES = {
  'manage-dataset': '/admin/manage',
  'faq': '/admin/faq',
  'inquiry': '/admin/feedback',
  'statistics': '/admin/analyze',
  'alarm': '/admin/noti',
  'chatbot': '/admin/ara',
  'admin-manage': '/master/manage',
  'company-config': '/master/dept',
} as const;

const ROUTE_TO_MENU_ID: Record<string, string> = Object.entries(MENU_ROUTES).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

const getUserRole = (pathname: string) => ({
  isAdmin: pathname.includes('/admin'),
  isMaster: pathname.includes('/master'),
});

const useSidebarMenu = (menuItems: MenuItem[]) => {
  const pathname = usePathname();
  const router = useRouter();

  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  useEffect(() => {
    const currentMenuId = ROUTE_TO_MENU_ID[pathname];
    if (currentMenuId) setActiveMenuItem(currentMenuId);
  }, [pathname]);

  const isMenuActive = useCallback((menuId: string): boolean => activeMenuItem === menuId, [activeMenuItem]);

  const isSubMenuActive = useCallback((parentId: string): boolean => {
    const parentMenu = menuItems.find(item => item.id === parentId);
    return !!parentMenu?.subItems?.some(subItem => subItem.id === activeMenuItem);
  }, [menuItems, activeMenuItem]);

  const handleMenuItemClick = useCallback((menuId: string, event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();

  const menu = menuItems.find(item => item.id === menuId);

  // 서브메뉴가 있다면 첫 번째 서브메뉴로 리다이렉트
  if (menu?.subItems && menu.subItems.length > 0) {
    const firstSubItemId = menu.subItems[0].id;
    setActiveMenuItem(firstSubItemId);
    const route = MENU_ROUTES[firstSubItemId as keyof typeof MENU_ROUTES];
    if (route) router.push(route);
    return;
  }

  // 서브메뉴가 없을 경우 본 메뉴로 이동
  setActiveMenuItem(menuId);
  const route = MENU_ROUTES[menuId as keyof typeof MENU_ROUTES];
  if (route) router.push(route);
}, [menuItems, router]);

  return {
    activeMenuItem,
    isMenuActive,
    isSubMenuActive,
    handleMenuItemClick,
  };
};

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, isMaster } = getUserRole(pathname);

  const menuItems = useMemo(() => isAdmin ? ADMIN_MENU_ITEMS : isMaster ? MASTER_MENU_ITEMS : ADMIN_MENU_ITEMS, [isAdmin, isMaster]);

  const {
    isMenuActive,
    isSubMenuActive,
    handleMenuItemClick,
  } = useSidebarMenu(menuItems);

  const renderSubMenuItem = useCallback((subItem: SubMenuItem) => (
    <li key={subItem.id} role="none">
      <a
        href="#"
        className={isMenuActive(subItem.id) ? 'is-active' : ''}
        onClick={(e) => handleMenuItemClick(subItem.id, e)}
        role="menuitem"
        tabIndex={0}
        aria-current={isMenuActive(subItem.id) ? 'page' : undefined}
      >
        {subItem.label}
      </a>
    </li>
  ), [isMenuActive, handleMenuItemClick]);

  const renderMenuItem = useCallback((item: MenuItem) => {
    const isActive = isMenuActive(item.id);
    const hasActiveSubMenu = isSubMenuActive(item.id);

    return (
      <li key={item.id}>
        <a
          href="#"
          className={isActive || hasActiveSubMenu ? 'is-active' : ''}
          onClick={(e) => handleMenuItemClick(item.id, e)}
          role="button"
          tabIndex={0}
          aria-expanded={!!item.subItems}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="icon" aria-hidden="true">
            <i className={item.icon} />
          </span>
          {item.label}
        </a>
        {item.subItems && (
          <ul className="is-active" role="menu">
            {item.subItems.map(renderSubMenuItem)}
          </ul>
        )}
      </li>
    );
  }, [isMenuActive, isSubMenuActive, handleMenuItemClick, renderSubMenuItem]);

  return (
    <aside className={`sidebar-aside ${className}`} role="navigation" aria-label="메인 네비게이션">
      <ul className="menu-list" role="menubar">
        {menuItems.map(renderMenuItem)}
      </ul>
    </aside>
  );
}