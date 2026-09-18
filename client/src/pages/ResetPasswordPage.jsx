import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircleIcon, CheckCircle2Icon, MailIcon, LockKeyholeIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import api from '@/api/axiosInstance';
import { formatError } from '@/lib/format';

function ForgotForm({ onSent }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      onSent(email.trim());
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      {error ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={submitting}>
        <MailIcon />
        Send reset link
      </Button>
    </form>
  );
}

function ResetForm({ token }) {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordValid = form.password.length >= 8;
  const confirmValid = form.password === form.confirm && form.confirm.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2Icon className="size-10 text-success" />
        <p className="font-semibold">Password updated</p>
        <p className="text-sm text-muted-foreground">You can now log in with your new password.</p>
        <Button type="button" render={<Link to="/login" />}>
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel>New password</FieldLabel>
        <Input
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        {form.password && !passwordValid ? <FieldError>At least 8 characters.</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel>Confirm new password</FieldLabel>
        <Input
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          required
        />
        {form.confirm && !confirmValid ? <FieldError>Passwords do not match.</FieldError> : null}
      </Field>
      {error ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={submitting} disabled={!passwordValid || !confirmValid}>
        <LockKeyholeIcon />
        Reset password
      </Button>
    </form>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [sentTo, setSentTo] = useState('');

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{token ? 'Reset your password' : 'Forgot your password?'}</CardTitle>
          <CardDescription>
            {token
              ? 'Choose a new password for your account.'
              : "We'll send a reset link to your email (demo — it prints to the server console)."}
          </CardDescription>
        </CardHeader>
        <CardPanel className="pb-6 pt-4">
          {token ? (
            <ResetForm token={token} />
          ) : sentTo ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2Icon className="size-10 text-success" />
              <p className="font-semibold">Reset link sent</p>
              <p className="text-sm text-muted-foreground">
                Check <span className="font-medium text-foreground">{sentTo}</span> (or the server
                console) for a password reset link.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => setSentTo('')}>
                Send to a different email
              </Button>
            </div>
          ) : (
            <ForgotForm onSent={setSentTo} />
          )}
        </CardPanel>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}