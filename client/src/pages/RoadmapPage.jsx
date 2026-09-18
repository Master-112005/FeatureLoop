import { useEffect, useState } from 'react';
import { Timeline } from '@/components/roadmap/Timeline';
import { EmptyState, RoadmapColumnSkeleton } from '@/components/shared/EmptyState';
import api from '@/api/axiosInstance';
import { formatError } from '@/lib/format';

export function RoadmapPage() {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/roadmap');
        if (!active) return;
        const map = {};
        for (const col of data.columns) map[col.status] = col.items;
        setColumns(map);
      } catch (err) {
        if (active) setError(formatError(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Public roadmap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What's planned, in progress and shipped. Requests under review stay in the feed until they
          land in a lane.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <RoadmapColumnSkeleton />
          <RoadmapColumnSkeleton />
          <RoadmapColumnSkeleton />
        </div>
      ) : error ? (
        <EmptyState variant="error" title="Could not load the roadmap" description={error} />
      ) : (
        <Timeline columns={columns} />
      )}
    </div>
  );
}