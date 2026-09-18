import { Link2Icon, MessagesSquareIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { MarkdownText } from '@/components/shared/MarkdownText';
import { CategoryPill } from '@/components/feed/CategoryPill';
import { StatusBadge } from '@/components/feed/StatusBadge';
import { UpvoteButton } from '@/components/feed/UpvoteButton';
import { CommentThread } from '@/components/comments/CommentThread';
import { useOptimisticVote } from '@/hooks/useOptimisticVote';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { timeAgo } from '@/lib/format';

/**
 * The full request detail (author row, title, description, vote + share
 * actions, comment thread). Pure — the parent owns data loading & sync.
 */
export function RequestDetailView({
  request,
  setRequest,
  comments,
  setComments,
  onSync,
  showFullThreadLink = false,
  sharable = true,
}) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { toggle, hasVoted, pending } = useOptimisticVote(request, setRequest);

  const handleVote = async () => {
    const result = await toggle();
    if (result?.requiresAuth) return;
    if (result?.error) toast.error('Vote failed', 'Try again in a moment.');
    else onSync?.();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/requests/${request.id}`);
      toast.success('Link copied', 'Share the thread anywhere.');
    } catch {
      toast.error('Copy failed', 'Clipboard access was blocked.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <AuthorAvatar author={request.author} status={request.status} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">
            {request.author?.username}
            {isAdmin && request.author?.role === 'admin' ? (
              <span className="ms-1 rounded-sm bg-primary px-1 py-0.5 text-[10px] font-medium text-primary-foreground">
                staff
              </span>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">{timeAgo(request.createdAt)}</div>
        </div>
        <StatusBadge status={request.status} />
      </header>

      <h1 className="text-xl font-semibold leading-snug text-foreground">{request.title}</h1>

      <div className="text-[15px] leading-7 text-foreground/90 sm:text-base">
        <MarkdownText source={request.description} />
      </div>

      <Separator />

      <footer className="flex flex-wrap items-center gap-3">
        <UpvoteButton voted={hasVoted} count={request.upvoteCount} onClick={handleVote} pending={pending} />
        <CategoryPill category={request.category} />
        <div className="ms-auto flex items-center gap-1.5">
          {showFullThreadLink ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              render={<Link to={`/requests/${request.id}`} className="gap-1.5" />}
            >
              <MessagesSquareIcon />
              Discussion
            </Button>
          ) : null}
          {sharable ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={handleShare}
            >
              <Link2Icon />
              Share
            </Button>
          ) : null}
        </div>
      </footer>

      <CommentThread
        requestId={request.id}
        comments={comments}
        setComments={setComments}
        onRequestUpdated={onSync}
      />
    </div>
  );
}