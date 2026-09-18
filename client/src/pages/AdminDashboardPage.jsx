import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { StatusTransitionPanel } from '@/components/admin/StatusTransitionPanel';
import { useAuth } from '@/context/AuthContext';
import { STATUS_FLOW } from '@/lib/constants';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import api from '@/api/axiosInstance';

const STATUS_FILTERS = [{ value: '', label: 'All statuses' }, ...STATUS_FLOW.map((s) => ({ value: s, label: s }))];

export function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth();

  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [counts, setCounts] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const load = async (status) => {
    setLoadingData(true);
    setError('');
    try {
      const [listRes, roadmapRes] = await Promise.all([
        api.get('/admin/requests', { params: { limit: 50, ...(status ? { status } : {}) } }),
        api.get('/roadmap'),
      ]);
      setItems(listRes.data.items);
      const map = {};
      for (const col of roadmapRes.data.columns) map[col.status] = col.items.length;
      setCounts(map);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load(statusFilter);
  }, [isAdmin, statusFilter]);

  const stats = useMemo(() => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { total, ...counts };
  }, [counts]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldIcon className="size-4.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Moderate feature requests and move them through the roadmap.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['All', stats.total ?? '—'],
          ['Planned', stats.Planned ?? '—'],
          ['In Progress', stats['In Progress'] ?? '—'],
          ['Completed', stats.Completed ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 overflow-x-auto">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-max">
          <TabsList className="w-max">
            {STATUS_FILTERS.map((f) => (
              <TabsTab key={f.value} value={f.value} className="px-3">
                {f.label}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loadingData ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No requests match this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Votes / Replies</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/40">
                  <td className="max-w-56 px-4 py-3 align-top">
                    <Link to={`/requests/${item.id}`} className="font-medium text-foreground hover:underline">
                      {item.title}
                    </Link>
                    <p className={cn('mt-0.5 truncate text-xs', item.status === 'Under Review' ? '' : 'text-muted-foreground')}>
                      {item.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">{item.author?.username || 'deleted'}</td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant={item.status === 'Under Review' ? 'outline' : undefined}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3 align-top tabular-nums">
                    {item.upvoteCount} / {item.commentCount}
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{timeAgo(item.updatedAt)}</td>
                  <td className="px-4 py-3 align-top">
                    <StatusTransitionPanel
                      request={item}
                      onUpdated={(updated) =>
                        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}