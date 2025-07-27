export interface PaginationProps {
  currentPage: number; // 현재 페이지 번호 (1부터 시작)
  totalPages: number; // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 시 콜백
  className?: string; // 추가 CSS 클래스
}

export interface PageItem {
  type: 'page' | 'ellipsis' | 'prev' | 'next';
  page?: number;
  isActive?: boolean;
  isDisabled?: boolean;
} 