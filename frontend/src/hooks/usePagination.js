import { useCallback, useEffect, useState } from 'react';

export default function usePagination(fetchFn, initial = { page: 1, limit: 10 }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initial.page || 1);
  const [limit] = useState(initial.limit || 10);
  const [loading, setLoading] = useState(false);

  const runFetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFn({ page: currentPage, limit });
      const payload = res?.data || {};
      const items = payload.data || payload.orders || payload.items || [];
      const paging = payload.pagination || {};
      setData(items);
      setTotal(payload.total || paging.total || 0);
      setPages(payload.pages || paging.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, currentPage, limit]);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  return {
    data,
    total,
    pages,
    currentPage,
    setPage: setCurrentPage,
    loading,
    limit,
    refetch: runFetch,
  };
}
