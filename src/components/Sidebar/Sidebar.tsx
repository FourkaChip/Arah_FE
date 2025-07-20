"use client";
import { useState } from 'react';
import './Sidebar.scss';
import { MenuItem, SidebarProps } from '../../types/sidebar';

// ===== 메뉴 데이터 =====
const menuItems: MenuItem[] = [
  {
    id: 'dataset',
    label: '데이터셋 관리',
    icon: 'fa-solid fa-user',
  },
  {
    id: 'inquiry',
    label: '문의 및 피드백',
    icon: 'fa-solid fa-comments',
    subItems: [
      { id: 'qna', label: 'Q&A' },
      { id: 'faq', label: 'FAQ' },
      { id: 'feedback', label: '피드백' },
    ],
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

// ===== 컴포넌트 =====
export default function Sidebar({ className = '' }: SidebarProps) {
  const [activeMenuItem, setActiveMenuItem] = useState<string>('dataset');

  // 메뉴 클릭 시 활성 메뉴 상태 업데이트
  const handleMenuItemClick = (
    menuId: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    setActiveMenuItem(menuId);
  };

  // 지정된 메뉴가 현재 활성 상태인지 확인
  const isMenuActive = (menuId: string): boolean => {
    return activeMenuItem === menuId;
  };

  // 부모 메뉴의 서브아이템 중 하나가 활성화되어 있는지 확인
  const isSubMenuActive = (parentId: string): boolean => {
    const parentMenu = menuItems.find((item) => item.id === parentId);
    if (!parentMenu?.subItems) return false;
    return parentMenu.subItems.some((subItem) => subItem.id === activeMenuItem);
  };

  // 단일 메뉴 아이템 렌더링 (서브메뉴 포함)
  const renderMenuItem = (item: MenuItem) => {
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
          aria-expanded={
            item.subItems ? (hasActiveSubMenu ? 'true' : 'false') : undefined
          }
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="icon" aria-hidden="true">
            <i className={item.icon}></i>
          </span>
          {item.label}
        </a>

        {item.subItems && (
          <ul className={hasActiveSubMenu ? 'is-active' : ''} role="menu">
            {item.subItems.map((subItem) => (
              <li key={subItem.id} role="none">
                <a
                  href="#"
                  className={isMenuActive(subItem.id) ? 'is-active' : ''}
                  onClick={(e) => handleMenuItemClick(subItem.id, e)}
                  role="menuitem"
                  tabIndex={0}
                  aria-current={
                    isMenuActive(subItem.id) ? 'page' : undefined
                  }
                >
                  {subItem.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  // 사이드바 렌더링
  return (
    <aside className={`sidebar-aside ${className}`} role="navigation" aria-label="메인 네비게이션">
      <ul className="menu-list" role="menubar">
        {menuItems.map(renderMenuItem)}
      </ul>
    </aside>
  );
}
