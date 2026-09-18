import { useEffect, useRef, useState } from 'react';
import { MessageCircleIcon } from 'lucide-react';
import { UpvoteButton } from '@/components/feed/UpvoteButton';
import { CategoryPill } from '@/components/feed/CategoryPill';
import { StatusBadge } from '@/components/feed/StatusBadge';
import { ROADMAP_COLUMNS } from '@/lib/constants';
import { useOptimisticVote } from '@/hooks/useOptimisticVote';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const PALETTE = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
];

function hashId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function colorFor(id) {
  return PALETTE[hashId(id) % PALETTE.length];
}

function shortId(id) {
  return `FL-${id.slice(-6).toUpperCase()}`;
}

function FeatureCard({ item, color, blinking, onBlink }) {
  const { toast } = useToast();
  const [request, setRequest] = useState(item);
  useEffect(() => setRequest(item), [item]);
  const { toggle, hasVoted, pending } = useOptimisticVote(request, setRequest);

  const handleVote = async () => {
    const result = await toggle();
    if (result?.error) toast.error('Vote failed', 'Try again in a moment.');
  };

  return (
    <button
      type="button"
      onClick={onBlink}
      className={cn(
        'flex w-full flex-col gap-2 rounded-2xl border bg-card p-4 text-left shadow-xs/5 transition-colors outline-none hover:border-foreground/15 focus-visible:ring-2 focus-visible:ring-ring',
        blinking && 'animate-[fl-blink_0.75s_ease-in-out_2]'
      )}
      style={blinking ? { '--fl-blink-color': color } : undefined}
    >
      <header className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold tracking-wide" style={{ color }}>
          {shortId(request.id)}
        </span>
        <CategoryPill category={request.category} />
        <span className="ms-auto shrink-0">
          <StatusBadge status={request.status} />
        </span>
      </header>

      <p className="text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
        {request.title}
      </p>
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {request.description}
      </p>

      <footer className="mt-1 flex items-center gap-3">
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
      </footer>
    </button>
  );
}

const COLUMN_DOT = {
  Planned: 'bg-sky-500',
  'In Progress': 'bg-amber-500',
  Completed: 'bg-emerald-500',
};

export function Timeline({ columns }) {
  const [blinkId, setBlinkId] = useState(null);
  const timerRef = useRef(null);
  const cardRefs = useRef({});

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const rows = ROADMAP_COLUMNS.flatMap((status) =>
    (columns[status] || []).map((item) => ({ ...item, status }))
  );

  const handlePick = (item) => {
    setBlinkId(item.id);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setBlinkId(null), 1650);
    cardRefs.current[item.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nothing on the roadmap yet. Requests under review land here once they're planned.
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">
        Click a node to jump to its feature — it will blink in its colour.
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="relative w-max min-w-full">
          <span
            aria-hidden
            className="absolute left-4 right-4 top-[11px] h-0.5 rounded-full bg-border"
          />
          <div className="relative flex items-start gap-8 px-6">
            {rows.map((item) => {
              const color = colorFor(item.id);
              const isActive = blinkId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePick(item)}
                  aria-pressed={isActive}
                  className="group flex w-24 shrink-0 flex-col items-center outline-none"
                >
                  <span className="flex h-6 items-center justify-center">
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-full border-2 bg-background transition-transform group-hover:scale-125',
                        isActive && 'scale-125 ring-2 ring-offset-1 ring-offset-background',
                        blinkId === item.id && 'animate-[fl-blink_0.75s_ease-in-out_2]'
                      )}
                      style={{ '--fl-blink-color': color, borderColor: color }}
                    >
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                    </span>
                  </span>
                  <span
                    className="mt-1 font-mono text-[11px] font-semibold tracking-wide"
                    style={{ color }}
                  >
                    {shortId(item.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-3 overscroll-x-contain">
        <div className="flex min-w-full w-max items-start gap-4">
          {ROADMAP_COLUMNS.map((status) => {
            const items = columns[status] || [];
            return (
              <section key={status} className="flex w-[min(82vw,22rem)] shrink-0 flex-col gap-3">
                <header className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', COLUMN_DOT[status])} />
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
                    items.map((item) => (
                      <div key={item.id} ref={(el) => (cardRefs.current[item.id] = el)}>
                        <FeatureCard
                          item={item}
                          color={colorFor(item.id)}
                          blinking={blinkId === item.id}
                          onBlink={() => handlePick(item)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}