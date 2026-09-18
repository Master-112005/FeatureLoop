import { useState } from 'react';
import { CornerDownRightIcon, Trash2Icon, EditIcon, XIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { MarkdownText } from '@/components/shared/MarkdownText';
import { CommentInput } from '@/components/comments/CommentInput';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

export function CommentItem({ comment, isReply = false, compact = false, onReply, onDelete, onUpdate }) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

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

  const handleEdit = async () => {
    if (!canModerate || !onUpdate) return;
    setEditContent(comment.content);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!onUpdate || !editContent.trim()) return;
    try {
      await onUpdate(comment.id, editContent.trim());
      setEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error('Could not update comment', err?.response?.data?.error || 'Try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditContent('');
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
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit comment"
                  onClick={handleEdit}
                >
                  <EditIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete comment"
                  onClick={() => onDelete(comment)}
                >
                  <Trash2Icon />
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className={cn('leading-relaxed text-foreground/90', compact ? 'text-sm' : 'text-[15px]')}>
          {comment.isDeleted ? (
            <span className="italic text-muted-foreground">[comment removed]</span>
          ) : editing ? (
            <div className="flex flex-col gap-2">
              <CommentInput
                autoFocus
                compact
                placeholder="Edit your comment…"
                submitLabel="Save"
                value={editContent}
                onChange={setEditContent}
                onSubmit={handleSaveEdit}
              />
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <XIcon className="size-3.5" />
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                  <CheckIcon className="size-3.5" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <MarkdownText source={comment.content} />
          )}
        </div>

        {!comment.isDeleted && !editing ? (
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