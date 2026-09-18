import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleIcon } from 'lucide-react';
import { UpvoteButton } from '@/components/feed/UpvoteButton';
import { CategoryPill } from '@/components/feed/CategoryPill';
import { ROADMAP_COLUMNS } from '@/lib/constants';
import { useOptimisticVote } from '@/hooks/useOptimisticVote';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export function KanbanCard({ item }) {
  const { toast } = useToast();
  const [request, setRequest] = useState(item);
  useEffect(() => setRequest(item), [item]);
  const { toggle, hasVoted, pending } = useOptimisticVote(request, setRequest);

  const handleVote = async () => {
    const result = await toggle();
    if (result?.error) toast.error('Vote failed', 'Try again in a moment.');
  };

  return (
    <Link
      to={`/requests/${request.id}`}
      className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs/5 transition-colors hover:border-foreground/15"
    >
      <p className="text-sm font-medium leading-snug text-foreground">{request.title}</p>
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{request.description}</p>
      <div className="mt-1 flex items-center gap-2">
        <UpvoteButton
          voted={hasVoted}
          count={request.upvoteCount}
          onClick={handleVote}
          pending={pending}
          size="sm"
        />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircleIcon className="size-3.5" />
          {request.commentCount}
        </span>
        <span className="ms-auto">
          <CategoryPill category={request.category} />
        </span>
      </div>
    </Link>
  );
}

export function KanbanBoard({ columns }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ROADMAP_COLUMNS.map((status) => {
        const items = columns[status] || [];
        return (
          <section key={status} className="flex flex-col gap-3">
            <header className="flex items-center gap-2">
              <span
                className={cn(
                  'size-2 rounded-full',
                  status === 'Planned' && 'bg-sky-500',
                  status === 'In Progress' && 'bg-amber-500',
                  status === 'Completed' && 'bg-emerald-500'
                )}
              />
              <h2 className="font-semibold">{status}</h2>
              <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {items.length}
              </span>
            </header>
            <div className="flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nothing here yet.
                </div>
              ) : (
                items.map((item) => <KanbanCard key={item.id} item={item} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}