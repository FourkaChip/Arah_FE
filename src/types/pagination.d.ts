export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface PageItem {
  type: 'page' | 'ellipsis' | 'prev' | 'next';
  page?: number;
  isActive?: boolean;
  isDisabled?: boolean;
} 