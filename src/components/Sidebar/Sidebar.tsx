"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from "next/navigation";
import './Sidebar.scss';
import { MenuItem, SubMenuItem, SidebarProps } from '@/types/sidebar';

// ===== 상수 및 설정 =====
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
  {
    id: 'inquiry',
    label: '피드백',
    icon: 'fa-solid fa-comments',
  },
  {
    id: 'statistics',
    label: '통계',
    icon: 'fa-solid fa-chart-simple',
  },
  {
    id: 'alarm',
    label: '알림',
    icon: 'fa-solid fa-bell',
  },
  {
    id: 'chatbot',
    label: '챗봇 설정',
    icon: 'fa-solid fa-robot',
  },
] as const;

const MASTER_MENU_ITEMS: MenuItem[] = [
  {
    id: 'admin-manage',
    label: '관리자 관리',
    icon: 'fa-solid fa-users-gear',
  },
  {
    id: 'company-config',
    label: '기업 설정',
    icon: 'fa-solid fa-gear',
  },
] as const;

const HIDDEN_PATHS = ['/master/login', '/admin/login'] as const;
const DEFAULT_ACTIVE_MENU = {
  ADMIN: 'manage-dataset',
  MASTER: 'admin-manage',
} as const;

// ===== 유틸리티 함수 =====
const findParentMenuId = (itemId: string, menuItems: MenuItem[]): string | null => {
  for (const menu of menuItems) {
    if (menu.subItems?.some(subItem => subItem.id === itemId)) {
      return menu.id;
    }
  }
  return null;
};

const findMenuItemById = (itemId: string, menuItems: MenuItem[]): MenuItem | null => {
  // 먼저 최상위 메뉴에서 찾기
  for (const menu of menuItems) {
    if (menu.id === itemId) {
      return menu;
    }
    // 서브메뉴에서도 찾기
    if (menu.subItems) {
      for (const subItem of menu.subItems) {
        if (subItem.id === itemId) {
          // 서브메뉴 아이템을 MenuItem 형태로 변환
          return {
            id: subItem.id,
            label: subItem.label,
            icon: '', // 서브메뉴는 아이콘이 없음
            subItems: undefined
          };
        }
      }
    }
  }
  return null;
};

const getUserRole = (pathname: string) => ({
  isAdmin: pathname.includes('/admin'),
  isMaster: pathname.includes('/master'),
});

// ===== 커스텀 훅 =====
const useSidebarMenu = (menuItems: MenuItem[]) => {
  const pathname = usePathname();
  const { isAdmin, isMaster } = getUserRole(pathname);
  
  const [activeMenuItem, setActiveMenuItem] = useState<string>(DEFAULT_ACTIVE_MENU.ADMIN);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['dataset']));

  // 초기 메뉴 설정
  useEffect(() => {
    const defaultActiveMenu = isAdmin 
      ? DEFAULT_ACTIVE_MENU.ADMIN 
      : isMaster 
        ? DEFAULT_ACTIVE_MENU.MASTER 
        : DEFAULT_ACTIVE_MENU.ADMIN;
    
    setActiveMenuItem(defaultActiveMenu);
    
    if (isAdmin) {
      setExpandedMenus(new Set(['dataset']));
    } else {
      setExpandedMenus(new Set());
    }
  }, [isAdmin, isMaster]);

  // 메뉴 상태 확인 함수들
  const isMenuActive = useCallback((menuId: string): boolean => {
    return activeMenuItem === menuId;
  }, [activeMenuItem]);

  const isSubMenuActive = useCallback((parentId: string): boolean => {
    const parentMenu = menuItems.find(item => item.id === parentId);
    if (!parentMenu?.subItems) return false;
    return parentMenu.subItems.some(subItem => subItem.id === activeMenuItem);
  }, [menuItems, activeMenuItem]);

  const isMenuExpanded = useCallback((menuId: string): boolean => {
    return expandedMenus.has(menuId);
  }, [expandedMenus]);

  // 부모 메뉴 클릭 처리
  const handleParentMenuClick = useCallback((menuId: string, clickedMenu: MenuItem) => {
    setExpandedMenus(prev => {
      if (prev.has(menuId)) {
        // 이미 펼쳐져 있으면 접기 로직
        const activeParent = findParentMenuId(activeMenuItem, menuItems);
        if (activeParent === menuId) {
          return prev; // 현재 활성 아이템이 이 서브메뉴에 속하면 접지 않음
        } else {
          return activeParent ? new Set([activeParent]) : new Set();
        }
      } else {
        // 접혀져 있으면 펼치고 첫 번째 서브메뉴 선택
        const firstSubItem = clickedMenu.subItems?.[0];
        if (firstSubItem) {
          setActiveMenuItem(firstSubItem.id);
        }
        
        const activeParent = findParentMenuId(activeMenuItem, menuItems);
        const newExpanded = new Set([menuId]);
        if (activeParent && activeParent !== menuId) {
          newExpanded.add(activeParent);
        }
        return newExpanded;
      }
    });
  }, [activeMenuItem, menuItems]);

  // 일반 메뉴 클릭 처리
  const handleRegularMenuClick = useCallback((menuId: string) => {
    setActiveMenuItem(menuId);
    
    const parentMenuId = findParentMenuId(menuId, menuItems);
    if (parentMenuId) {
      setExpandedMenus(new Set([parentMenuId]));
    } else {
      setExpandedMenus(new Set());
    }
  }, [menuItems]);

  // 메뉴 클릭 핸들러
  const handleMenuItemClick = useCallback((
    menuId: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    
    const clickedMenu = findMenuItemById(menuId, menuItems);
    if (!clickedMenu) return;

    if (clickedMenu.subItems) {
      handleParentMenuClick(menuId, clickedMenu);
    } else {
      handleRegularMenuClick(menuId);
    }
  }, [menuItems, handleParentMenuClick, handleRegularMenuClick]);

  return {
    activeMenuItem,
    expandedMenus,
    isMenuActive,
    isSubMenuActive,
    isMenuExpanded,
    handleMenuItemClick,
  };
};

// ===== 메인 컴포넌트 =====
export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, isMaster } = getUserRole(pathname);

  const menuItems = useMemo(() => {
    return isAdmin ? ADMIN_MENU_ITEMS : isMaster ? MASTER_MENU_ITEMS : ADMIN_MENU_ITEMS;
  }, [isAdmin, isMaster]);

  const {
    isMenuActive,
    isSubMenuActive,
    isMenuExpanded,
    handleMenuItemClick,
  } = useSidebarMenu(menuItems);

  // 메뉴 아이템 렌더링
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
    const isExpanded = isMenuExpanded(item.id);

    return (
      <li key={item.id}>
        <a
          href="#"
          className={isActive || hasActiveSubMenu ? 'is-active' : ''}
          onClick={(e) => handleMenuItemClick(item.id, e)}
          role="button"
          tabIndex={0}
          aria-expanded={item.subItems ? isExpanded : undefined}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="icon" aria-hidden="true">
            <i className={item.icon} />
          </span>
          {item.label}
        </a>

        {item.subItems && isExpanded && (
          <ul className="is-active" role="menu">
            {item.subItems.map(renderSubMenuItem)}
          </ul>
        )}
      </li>
    );
  }, [isMenuActive, isSubMenuActive, isMenuExpanded, handleMenuItemClick, renderSubMenuItem]);

  // 숨겨진 경로에서는 사이드바 숨김
  if (HIDDEN_PATHS.some(path => pathname === path)) {
    return null;
  }

  return (
    <aside 
      className={`sidebar-aside ${className}`} 
      role="navigation" 
      aria-label="메인 네비게이션"
    >
      <ul className="menu-list" role="menubar">
        {menuItems.map(renderMenuItem)}
      </ul>
    </aside>
  );
}
