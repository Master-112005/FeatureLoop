import { useEffect, useState } from 'react';
import { MessageCircleIcon, MessagesSquareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { MarkdownText } from '@/components/shared/MarkdownText';
import { CategoryPill } from '@/components/feed/CategoryPill';
import { StatusBadge } from '@/components/feed/StatusBadge';
import { UpvoteButton } from '@/components/feed/UpvoteButton';
import { useOptimisticVote } from '@/hooks/useOptimisticVote';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Wide feed tile. Carries the full details (title + description) inside the
 * post; the right-hand Discussion button / card click opens the discussion
 * panel (comments) next to it.
 */
export function PostCard({ item, onOpen }) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState(item);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setRequest(item);
  }, [item]);

  const { toggle, hasVoted, pending } = useOptimisticVote(request, setRequest);

  const handleVote = async (e) => {
    e.stopPropagation();
    const result = await toggle();
    if (result?.requiresAuth) return;
    if (result?.error) toast.error('Vote failed', 'Try again in a moment.');
  };

  const isDescriptionLong = (request.description || '').length > 160;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View details for ${request.title}`}
      onClick={() => onOpen?.(request)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.(request);
        }
      }}
      className="group flex w-full max-w-[470px] cursor-pointer flex-col gap-2.5 rounded-2xl border bg-card p-4 text-card-foreground shadow-xs/5 outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
    >
      <header className="flex shrink-0 items-center gap-2.5">
        <AuthorAvatar author={request.author} />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {request.author?.username}
            {isAdmin && request.author?.role === 'admin' ? (
              <span className="ms-1 rounded-sm bg-primary px-1 py-0.5 text-[9px] font-medium text-primary-foreground">
                staff
              </span>
            ) : null}
          </span>
          <span className="block text-xs text-muted-foreground">{timeAgo(request.createdAt)}</span>
        </div>
        {request.status !== 'Under Review' ? (
          <span className="shrink-0">
            <StatusBadge status={request.status} />
          </span>
        ) : null}
      </header>

      <h3 className="text-lg font-bold leading-snug text-foreground sm:text-xl">{request.title}</h3>

      <div className={cn('text-sm leading-6 text-foreground/80', expanded ? 'max-h-96 overflow-y-auto' : '')}>
        <div className={cn('overflow-hidden', expanded ? '' : 'line-clamp-6')}>
          <MarkdownText source={request.description} />
        </div>
        {isDescriptionLong ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        ) : null}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center gap-2.5 border-t pt-3 sm:gap-3">
        <UpvoteButton
          voted={hasVoted}
          count={request.upvoteCount}
          onClick={handleVote}
          pending={pending}
        />
        <span
          role="button"
          tabIndex={0}
          onClick={() => onOpen?.(request)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen?.(request);
            }
          }}
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Open comments (${request.commentCount})`}
        >
          <MessageCircleIcon className="size-4" />
          <span className="tabular-nums">{request.commentCount}</span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => onOpen?.(request)}
        >
          <MessagesSquareIcon className="size-4" />
          Discussion
        </Button>
        <span className="ms-auto shrink-0">
          <CategoryPill category={request.category} />
        </span>
      </footer>
    </article>
  );
}