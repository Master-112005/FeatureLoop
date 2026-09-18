import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { GripVerticalIcon, ShieldIcon, ShieldAlertIcon } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogPopup, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogClose } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROADMAP_COLUMNS, badgeVariantForCategory } from '@/lib/constants';
import { formatError } from '@/lib/format';
import { cn } from '@/lib/utils';
import api from '@/api/axiosInstance';

const COLUMN_DOT = {
  Planned: 'bg-sky-500',
  'In Progress': 'bg-amber-500',
  Completed: 'bg-emerald-500',
};

const DRAG_OVER_CLASS = 'feature-column-over';

function FeatureCard({ item }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        const dt = e.dataTransfer || e.nativeEvent?.dataTransfer;
        if (dt) {
          dt.setData('text/plain', item.id);
          dt.effectAllowed = 'move';
        }
      }}
      className="cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-colors hover:border-primary/40 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/requests/${item.id}`}
          draggable={false}
          className="line-clamp-2 text-sm font-medium text-foreground hover:underline"
        >
          {item.title}
        </Link>
        <GripVerticalIcon className="mt-0.5 shrink-0 text-muted-foreground/60" />
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {item.category ? (
          <Badge variant={badgeVariantForCategory(item.category)}>{item.category}</Badge>
        ) : null}
        <span className="tabular-nums text-muted-foreground">
          {item.upvoteCount} votes · {item.commentCount} replies
        </span>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [force, setForce] = useState(null);

  const itemsRef = useRef(null);
  const applyMoveRef = useRef(null);

  useEffect(() => {
    itemsRef.current = items;
  });

  const load = async () => {
    setLoadingData(true);
    setError('');
    try {
      const res = await api.get('/admin/requests', { params: { limit: 100 } });
      setItems(res.data.items);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const refreshSilently = async () => {
    try {
      const res = await api.get('/admin/requests', { params: { limit: 100 } });
      setItems(res.data.items);
    } catch (err) {
      toast.error('Failed to reload board', formatError(err));
    }
  };

  const applyMove = async (item, status, isForced) => {
    if (isForced) {
      setForce(null);
    }

    try {
      const { data } = await api.patch(`/admin/requests/${item.id}/status`, {
        status,
        force: !!isForced,
      });

      setItems((current) =>
        current.map((it) =>
          it.id === item.id
            ? {
                ...it,
                ...data.item,
                status: data.item.status,
                upvoteCount: data.item.upvoteCount ?? it.upvoteCount,
                commentCount: data.item.commentCount ?? it.commentCount,
              }
            : it
        )
      );

      toast.success(`Moved to ${data.item.status}`, isForced ? 'Sequence override applied.' : undefined);
      await refreshSilently();
      return true;
    } catch (err) {
      if (err?.response?.status === 409 && !isForced) {
        setForce({ item, status });
        return false;
      }
      toast.error('Transition failed', formatError(err));
      return false;
    }
  };
  useEffect(() => {
    applyMoveRef.current = applyMove;
  });

  const columns = useMemo(
    () =>
      ROADMAP_COLUMNS.map((status) => ({
        status,
        items: items.filter((it) => it.status === status),
      })),
    [items]
  );

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const attachColumn = (el, status) => {
    if (!el) return;
    el.ondragover = (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      el.classList.add(DRAG_OVER_CLASS);
    };
    el.ondragleave = () => el.classList.remove(DRAG_OVER_CLASS);
    el.ondrop = (e) => {
      e.preventDefault();
      el.classList.remove(DRAG_OVER_CLASS);
      const raw = e.dataTransfer?.getData('text/plain') || '';
      const item = itemsRef.current?.find((it) => it.id === raw);
      if (!item || item.status === status) return;
      applyMoveRef.current?.(item, status, false);
    };
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldIcon className="size-4.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Drag feature requests between columns to move them through the roadmap.
          </p>
        </div>
      </div>

      {loadingData ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map(({ status, items: colItems }) => (
            <div
              key={status}
              ref={(el) => attachColumn(el, status)}
              className="flex min-h-[40vh] flex-col rounded-xl border border-muted bg-card/50 p-3 transition-colors"
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={cn('size-2.5 rounded-full', COLUMN_DOT[status])} />
                <h2 className="text-sm font-semibold">{status}</h2>
                <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                  {colItems.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {colItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                    Drop requests here
                  </div>
                ) : (
                  colItems.map((item) => <FeatureCard key={item.id} item={item} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .${DRAG_OVER_CLASS} { border-color: hsl(221 83% 53%); background: hsl(221 83% 53% / 0.06); }
      `}</style>

      <AlertDialog open={!!force} onOpenChange={(open) => !open && setForce(null)}>
        <AlertDialogTrigger className="hidden" />
        <AlertDialogPopup className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlertIcon className="size-5 text-warning" />
              Override status sequence?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This moves "{force?.item?.title}" straight to "{force?.status}", skipping or reversing the
              normal flow (Under Review → Planned → In Progress → Completed). Force it anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              type="button"
              variant="default"
              onClick={() => force && applyMoveRef.current?.(force.item, force.status, true)}
            >
              Force move
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}