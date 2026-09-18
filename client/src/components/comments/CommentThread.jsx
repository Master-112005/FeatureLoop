import { useMemo, useState } from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { CommentItem } from '@/components/comments/CommentItem';
import { CommentInput } from '@/components/comments/CommentInput';
import api from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatError } from '@/lib/format';

function buildThread(items) {
  const byId = new Map(items.map((c) => [c.id, { ...c, replies: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    if (node.parentComment && byId.has(node.parentComment)) {
      byId.get(node.parentComment).replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function CommentThread({
  requestId,
  comments,
  setComments,
  onRequestUpdated,
  compact = false,
}) {
  const { user, openAuthGate } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const thread = useMemo(() => buildThread(comments), [comments]);

  const handleAdd = async (content, parentComment = null) => {
    if (!user) {
      openAuthGate();
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/requests/${requestId}/comments`, {
        content,
        parentComment,
      });
      setComments((prev) => [...prev, data.item]);
      onRequestUpdated?.();
    } catch (err) {
      toast.error('Could not post comment', formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment) => {
    try {
      const { data } = await api.delete(`/comments/${comment.id}`);
      setComments((prev) => prev.map((c) => (c.id === data.item.id ? data.item : c)));
      onRequestUpdated?.();
      toast.info('Comment removed', 'The comment was soft-deleted.');
    } catch (err) {
      toast.error('Could not delete comment', formatError(err));
    }
  };

  if (compact) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
          <MessageSquareIcon className="size-3.5" />
          <span className="text-xs font-medium">
            {comments.length} comment{comments.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {thread.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <>
              <div className="divide-y divide-border/70 border-t">
                {thread.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    compact
                    onReply={(content, parent) => handleAdd(content, parent.id)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
              <p className="pt-3 text-center text-xs text-muted-foreground">
                End of discussion
              </p>
            </>
          )}
        </div>

        <div className="mt-3 shrink-0 border-t pt-3">
          <CommentInput
            compact
            autoFocus
            onSubmit={(content) => handleAdd(content)}
            submitting={submitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center gap-2">
        <MessageSquareIcon className="size-4 text-muted-foreground" />
        <h3 className="font-semibold">{comments.length} comment{comments.length === 1 ? '' : 's'}</h3>
      </div>

      <CommentInput onSubmit={(content) => handleAdd(content)} submitting={submitting} />

      {thread.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No comments yet. Start the conversation above.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-border/70 border-t">
          {thread.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(content, parent) => handleAdd(content, parent.id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}