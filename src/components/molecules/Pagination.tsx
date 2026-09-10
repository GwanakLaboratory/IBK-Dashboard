import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const pageNumbersToShow = new Set(
    [1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter(
      (page) => page >= 1 && page <= totalPages,
    ),
  );
  const sortedPageNumbers = [...pageNumbersToShow].sort(
    (pageA, pageB) => pageA - pageB,
  );

  const visibleItems: ('ellipsis' | number)[] = [];
  sortedPageNumbers.forEach((page, index) => {
    const previousPage = sortedPageNumbers[index - 1];
    if (previousPage !== undefined && page - previousPage > 1) {
      visibleItems.push('ellipsis');
    }
    visibleItems.push(page);
  });

  return visibleItems;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePageNumbers = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePageNumbers.map((pageItem, index) => {
        if (pageItem === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
            >
              …
            </span>
          );
        }

        const isCurrentPage = pageItem === currentPage;

        return (
          <Button
            key={pageItem}
            variant={isCurrentPage ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(pageItem)}
            aria-current={isCurrentPage ? 'page' : undefined}
          >
            {pageItem}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
