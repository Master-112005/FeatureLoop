import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircleIcon, CheckCircle2Icon, LoaderIcon, MailCheckIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/api/axiosInstance';
import { formatError } from '@/lib/format';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get(`/auth/verify/${token}`);
        if (active) setState({ status: 'success', message: data.message });
      } catch (err) {
        if (active) setState({ status: 'error', message: formatError(err) });
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>
            {state.status === 'loading' ? 'Checking your link…' : 'FeatureLoop'}
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col items-center gap-3 py-8 text-center">
          {state.status === 'loading' ? (
            <LoaderIcon className="size-10 animate-spin text-muted-foreground" />
          ) : state.status === 'success' ? (
            <>
              <CheckCircle2Icon className="size-10 text-success" />
              <p className="font-semibold">{state.message}</p>
              <Button type="button" variant="outline" size="sm" render={<Link to="/login" />}>
                Go to login
              </Button>
            </>
          ) : (
            <>
              <AlertCircleIcon className="size-10 text-destructive" />
              <p className="text-sm text-destructive">{state.message}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MailCheckIcon className="size-4" />
                Need a fresh link? Contact the admin.
              </p>
            </>
          )}
        </CardPanel>
      </Card>
    </div>
  );
}