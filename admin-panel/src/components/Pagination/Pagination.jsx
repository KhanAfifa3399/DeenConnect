import styles from './Pagination.module.css';

function getPageNumbers(currentPage, totalPages) {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let lastPage;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (const page of range) {
    if (lastPage) {
      if (page - lastPage === 2) {
        rangeWithDots.push(lastPage + 1);
      } else if (page - lastPage > 2) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(page);
    lastPage = page;
  }

  return rangeWithDots;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className={styles.wrapper}>
      <span className={styles.info}>
        Showing {startItem}-{endItem} of {totalItems}
      </span>
      <div className={styles.controls}>
        <button
          className={styles.pageButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={`dots-${idx}`} className={styles.dots}>…</span>
          ) : (
            <button
              key={num}
              className={num === currentPage ? `${styles.pageButton} ${styles.activePage}` : styles.pageButton}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          )
        )}
        <button
          className={styles.pageButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default Pagination;