import { useMemo } from 'react';
import { PaginationProps, PageItem } from '@/types/pagination';
import './Pagination.scss';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  const pageItems = useMemo((): PageItem[] => {
    const items: PageItem[] = [];
    
    // 10개 미만이면 모든 페이지 표시
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        items.push({
          type: 'page',
          page: i,
          isActive: i === currentPage
        });
      }
    } else {
      // 10개 이상이면 10개 단위로 그룹화
      const pagesPerGroup = 10;
      const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
      const startPage = currentGroup * pagesPerGroup + 1;
      const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push({
          type: 'page',
          page: i,
          isActive: i === currentPage
        });
      }
    }

    return items;
  }, [currentPage, totalPages]);

  // 데이터가 없거나 페이지가 1개 이하면 페이지네이션을 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleGroupChange = (direction: 'prev' | 'next') => {
    const pagesPerGroup = 10;
    const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
    
    if (direction === 'prev' && currentGroup > 0) {
      const prevGroupLastPage = currentGroup * pagesPerGroup;
      handlePageChange(prevGroupLastPage);
    } else if (direction === 'next') {
      const nextGroupFirstPage = (currentGroup + 1) * pagesPerGroup + 1;
      if (nextGroupFirstPage <= totalPages) {
        handlePageChange(nextGroupFirstPage);
      }
    }
  };

  const pagesPerGroup = 10;
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  
  // 10개 미만이면 그룹 네비게이션 비활성화
  const hasNextGroup = totalPages > 10 && (currentGroup + 1) * pagesPerGroup < totalPages;
  const hasPrevGroup = totalPages > 10 && currentGroup > 0;

  return (
    <nav 
      className={`pagination is-centered ${className}`}
      role="navigation" 
      aria-label="페이지네이션"
    >
      <button
        className={`pagination-previous ${!hasPrevGroup ? 'is-disabled' : ''}`}
        onClick={() => handleGroupChange('prev')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleGroupChange('prev');
          }
        }}
        disabled={!hasPrevGroup}
        aria-label="이전 페이지 그룹으로 이동"
      >
        <i className="fa-solid fa-angle-left"></i>
      </button>

      <button
        className={`pagination-next ${!hasNextGroup ? 'is-disabled' : ''}`}
        onClick={() => handleGroupChange('next')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleGroupChange('next');
          }
        }}
        disabled={!hasNextGroup}
        aria-label="다음 페이지 그룹으로 이동"
      >
        <i className="fa-solid fa-angle-right"></i>
      </button>

      <ul className="pagination-list">
        {pageItems.map((item, index) => (
          <li key={index}>
            <button
              className={`pagination-link ${item.isActive ? 'is-current' : ''}`}
              onClick={() => handlePageChange(item.page!)}
              aria-label={
                item.isActive 
                  ? `현재 페이지, ${item.page}페이지` 
                  : `${item.page}페이지로 이동`
              }
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 
