import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { formatError } from '@/lib/format';

export function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form.emailOrUsername.trim(), form.password);
      onSuccess?.();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel>Email or username</FieldLabel>
        <Input
          name="emailOrUsername"
          autoComplete="username"
          placeholder="you@example.com"
          value={form.emailOrUsername}
          onChange={(e) => setForm((f) => ({ ...f, emailOrUsername: e.target.value }))}
          required
        />
      </Field>

      <Field>
        <FieldLabel>
          Password
          <Link
            to="/reset-password"
            className="ms-auto text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => onSuccess?.()}
          >
            Forgot password?
          </Link>
        </FieldLabel>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
        {submitting ? <LoaderIcon /> : 'Log in'}
      </Button>
    </form>
  );
}