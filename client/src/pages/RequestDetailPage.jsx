import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RequestDetailView } from '@/components/feed/RequestDetailView';
import api from '@/api/axiosInstance';
import { formatError } from '@/lib/format';

export function RequestDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: reqData }, { data: commentsData }] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get(`/requests/${id}/comments`),
      ]);
      setRequest(reqData.item);
      setComments(commentsData.items);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">{error || 'This request no longer exists.'}</p>
        <Button type="button" variant="outline" size="sm" render={<Link to="/" />}>
          <ArrowLeftIcon />
          Back to feed
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to feed
      </Link>

      <article className="rounded-2xl border bg-card p-5 text-card-foreground shadow-xs/5 sm:p-7">
        <RequestDetailView
          request={request}
          setRequest={setRequest}
          comments={comments}
          setComments={setComments}
          onSync={load}
        />
      </article>
    </div>
  );
}