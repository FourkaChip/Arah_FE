'use client';

import { useMemo } from 'react';
import { PaginationProps, PageItem } from '@/types/pagination';
import './Pagination.scss';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  // 페이지네이션에 표시할 페이지 번호들을 계산 (10개씩 그룹)
  const pageItems = useMemo((): PageItem[] => {
    const items: PageItem[] = [];
    const pagesPerGroup = 10; // 한 번에 표시할 페이지 수
    
    // 현재 페이지가 속한 그룹 계산 
    const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
    
    // 현재 그룹의 시작 페이지와 끝 페이지 계산
    const startPage = currentGroup * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
    
    // 현재 그룹의 페이지들을 items에 추가
    for (let i = startPage; i <= endPage; i++) {
      items.push({
        type: 'page',
        page: i,
        isActive: i === currentPage
      });
    }

    return items;
  }, [currentPage, totalPages]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // 그룹 이동 핸들러
  const handleGroupChange = (direction: 'prev' | 'next') => {
    const pagesPerGroup = 10;
    const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
    
    if (direction === 'prev' && currentGroup > 0) {
      // 이전 그룹의 마지막 페이지로 이동
      const prevGroupLastPage = currentGroup * pagesPerGroup;
      handlePageChange(prevGroupLastPage);
    } else if (direction === 'next') {
      // 다음 그룹의 첫 번째 페이지로 이동
      const nextGroupFirstPage = (currentGroup + 1) * pagesPerGroup + 1;
      if (nextGroupFirstPage <= totalPages) {
        handlePageChange(nextGroupFirstPage);
      }
    }
  };

  // 페이지가 1개 이하면 페이지네이션을 렌더링하지 않음
  // if (totalPages <= 1) {
  //   return null;
  // }

  // 현재 그룹 정보 계산
  const pagesPerGroup = 10;
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const hasNextGroup = (currentGroup + 1) * pagesPerGroup < totalPages;
  const hasPrevGroup = currentGroup > 0;

  return (
    <nav 
      className={`pagination is-centered ${className}`}
      role="navigation" 
      aria-label="페이지네이션"
    >
      {/* 이전 그룹 버튼 */}
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

      {/* 다음 그룹 버튼 */}
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

      {/* 페이지 번호 목록 */}
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