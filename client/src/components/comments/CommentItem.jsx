import { useState } from 'react';
import { CornerDownRightIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { MarkdownText } from '@/components/shared/MarkdownText';
import { CommentInput } from '@/components/comments/CommentInput';
import { useAuth } from '@/context/AuthContext';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

export function CommentItem({ comment, isReply = false, compact = false, onReply, onDelete }) {
  const { user, isAdmin } = useAuth();
  const [replying, setReplying] = useState(false);

  const authorId = comment.author?.id || comment.author?._id;
  const canModerate = user && (isAdmin || String(user.id) === String(authorId));

  const handleReply = async (content) => {
    if (!onReply) return;
    try {
      await onReply(content, comment);
      setReplying(false);
    } catch {
      /* error handling handled by CommentThread via toast */
    }
  };

  return (
    <div className={cn(isReply ? 'ms-4 border-s ps-4 sm:ms-8 sm:ps-6' : '')}>
      <div className="flex flex-col gap-2 py-3">
        <div className="flex items-center gap-2.5">
          <AuthorAvatar author={comment.author} size="sm" />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.author?.username || 'deleted'}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
              {comment.isEdited ? ' · edited' : ''}
            </span>
          </div>
          <div className="ms-auto flex items-center gap-1">
            {canModerate && !comment.isDeleted ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete comment"
                onClick={() => onDelete(comment)}
              >
                <Trash2Icon />
              </Button>
            ) : null}
          </div>
        </div>

        <div className={cn('leading-relaxed text-foreground/90', compact ? 'text-sm' : 'text-[15px]')}>
          {comment.isDeleted ? (
            <span className="italic text-muted-foreground">[comment removed]</span>
          ) : (
            <MarkdownText text={comment.content} />
          )}
        </div>

        {!comment.isDeleted ? (
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setReplying((r) => !r)}
            >
              <CornerDownRightIcon className="size-3.5" />
              Reply
            </button>
          </div>
        ) : null}

        {replying ? (
          <div className="mt-1">
            <CommentInput
              autoFocus
              compact={compact}
              placeholder="Write a reply…"
              submitLabel="Reply"
              onSubmit={handleReply}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}