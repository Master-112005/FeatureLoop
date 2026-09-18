import { useCallback, useEffect, useRef, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/shared/SearchBar';
import { PostCard } from '@/components/feed/PostCard';
import { DiscussionPanel } from '@/components/feed/DiscussionPanel';
import { FeedSkeleton } from '@/components/shared/FeedSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/api/axiosInstance';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 9;

export function FeedPage({ query, onQueryChange, category, sort, onNewRequest }) {
  const { toast } = useToast();
  const debouncedQuery = useDebounce(query, 350);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  const [selected, setSelected] = useState(null);
  const panelOpen = Boolean(selected);

  const sentinelRef = useRef(null);
  const skipRef = useRef(false);

  const fetchPage = useCallback(
    async (pageNumber, replace) => {
      if (skipRef.current) return false;
      if (replace) setInitialLoading(true);
      else setLoadingMore(true);
      try {
        const { data } = await api.get('/requests', {
          params: {
            sort,
            category: category || undefined,
            q: debouncedQuery || undefined,
            page: pageNumber,
            limit: PAGE_SIZE,
          },
        });
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        setTotalPages(data.pagination.totalPages);
        return true;
      } catch (err) {
        if (replace) {
          setError(err?.response?.data?.error || 'Failed to load requests');
        } else {
          toast.error('Failed to load more', 'Try again in a moment.');
        }
        return false;
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setHasFetched(true);
      }
    },
    [sort, category, debouncedQuery, toast]
  );

  useEffect(() => {
    setError('');
    setItems([]);
    setPage(1);
    setTotalPages(1);
    fetchPage(1, true);
  }, [fetchPage]);

useEffect(() => {
    const el = sentinelRef.current;
    if (!el || initialLoading) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
          const next = page + 1;
          setPage(next);
          fetchPage(next, false);
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [initialLoading, loadingMore, page, totalPages, fetchPage]);

  const refreshItem = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setItems((prev) => prev.map((it) => (it.id === id ? data.item : it)));
      setSelected((prevSel) => (!prevSel || prevSel.id !== id ? prevSel : data.item));
    } catch {
      /* silent — feed will refresh on next fetch */
    }
  }, []);

  const closePanel = useCallback(() => setSelected(null), []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <div
        className={cn(
          'grid gap-0 sm:gap-3 sm:transition-[grid-template-columns] sm:duration-300 sm:ease-out',
          panelOpen ? 'sm:grid-cols-[minmax(0,1fr)_340px]' : 'sm:grid-cols-[minmax(0,1fr)_0px]'
        )}
      >
        <section className="flex min-w-0 flex-col items-center">
          <div className="flex flex-col items-center gap-4 sm:hidden">
            <SearchBar value={query} onSearch={onQueryChange} />
          </div>

          {initialLoading ? (
            <FeedSkeleton />
          ) : error ? (
            <EmptyState
              variant="error"
              title="Could not load the feed"
              description={error}
              actionLabel="Try again"
              onAction={() => {
                skipRef.current = false;
                fetchPage(1, true);
              }}
            />
          ) : items.length === 0 ? (
            <EmptyState
              variant={debouncedQuery ? 'no-results' : 'empty'}
              title={debouncedQuery ? 'No matches' : 'No feature requests yet'}
              description={
                debouncedQuery
                  ? `Nothing matches "${debouncedQuery}". Try different keywords.`
                  : 'Be the first — submit an idea and start the conversation.'
              }
              actionLabel={!debouncedQuery ? 'Submit a request' : undefined}
              onAction={onNewRequest}
            />
) : (
            <>
              <div className="grid w-full max-w-[470px] grid-cols-1 gap-4 sm:max-w-[470px]">
                {items.map((item) => (
                  <PostCard key={item.id} item={item} onOpen={setSelected} />
                ))}
              </div>
              {page < totalPages ? (
                <div
                  ref={sentinelRef}
                  className="flex justify-center py-4 text-sm text-muted-foreground"
                >
                  {loadingMore ? 'Loading more…' : 'Scroll for more'}
                </div>
              ) : hasFetched && items.length > PAGE_SIZE ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  You've reached the end of the loop.
                </p>
              ) : null}
            </>
          )}
        </section>

        <DiscussionPanel
          id={selected?.id}
          open={panelOpen}
          onClose={closePanel}
          onCommentsChange={refreshItem}
        />
      </div>

      <Button
        type="button"
        size="icon"
        className="fixed bottom-6 right-6 z-30 size-12 rounded-full shadow-lg sm:hidden"
        aria-label="Submit a feature request"
        onClick={onNewRequest}
      >
        <PlusIcon className="size-5" />
      </Button>
    </div>
  );
}