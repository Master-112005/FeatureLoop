import { useEffect, useState } from 'react';
import { MessagesSquareIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentThread } from '@/components/comments/CommentThread';
import api from '@/api/axiosInstance';
import { formatError } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Discussion-only window on the right side of the feed. The post's details
 * live inside the card; this pane carries just the comment thread.
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
        'w-full flex-col rounded-t-2xl border-t bg-background shadow-2xl',
        open ? 'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh]' : 'hidden sm:flex',
        'sm:sticky sm:top-20 sm:z-auto sm:max-h-[calc(100dvh-7rem)] sm:min-w-0 sm:overflow-hidden sm:rounded-2xl sm:border sm:shadow-xl/10 sm:transition-opacity sm:duration-300 sm:ease-out',
        open ? 'sm:opacity-100' : 'sm:pointer-events-none sm:opacity-0'
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-3.5 w-4/5" />
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