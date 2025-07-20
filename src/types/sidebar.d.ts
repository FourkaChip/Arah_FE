// 사이드바에서 사용되는 데이터 타입을 관리하는 파일입니다.

// 메뉴 아이템 타입 정의
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  subItems?: SubMenuItem[];
}

// 서브 메뉴 아이템 타입 정의
export interface SubMenuItem {
  id: string;
  label: string;
}

// 사이드바 컴포넌트 Props 타입 정의
export interface SidebarProps {
  className?: string;
}

// 메뉴 데이터 타입 (readonly로 정의하여 불변성 보장)
export type MenuItems = readonly MenuItem[]; 