import { useEffect, useState } from 'react';
import { MessagesSquareIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentThread } from '@/components/comments/CommentThread';
import api from '@/api/axiosInstance';
import { formatError } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Floating 380px square discussion on the right side of the feed.
 * Slides in/out; on small screens it becomes a bottom sheet.
 */
export function DiscussionPanel({ id, open, onClose, onCommentsChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const { data } = await api.get(`/requests/${id}/comments`);
        if (active) setComments(data.items);
      } catch (err) {
        if (active) setError(formatError(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      active = false;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, id, onClose]);

  return (
    <aside
      className={cn(
        'fixed z-30 flex w-full flex-col bg-background shadow-2xl',
        'inset-x-0 bottom-0 max-h-[80dvh] rounded-t-2xl border-t',
        'sm:inset-x-auto sm:bottom-auto sm:left-auto sm:right-40 sm:top-[58%] sm:h-[480px] sm:w-[480px] sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:shadow-xl/10 sm:transition-all sm:duration-300 sm:ease-out',
        open
          ? 'visible opacity-100 sm:translate-x-0'
          : 'pointer-events-none invisible opacity-0 sm:translate-x-[calc(100%+2rem)]'
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <MessagesSquareIcon className="size-4" />
          Discussion
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close discussion"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <CommentThread
            compact
            requestId={id}
            comments={comments}
            setComments={setComments}
            onRequestUpdated={() => onCommentsChange?.(id)}
          />
        )}
      </div>
    </aside>
  );
}