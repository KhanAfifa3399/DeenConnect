import { useState, useMemo } from 'react';

export function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }

  return { currentPage, totalPages, paginatedItems, goToPage };
}