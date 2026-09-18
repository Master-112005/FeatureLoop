import { useState } from 'react';
import { AlertCircleIcon, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import api from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatError } from '@/lib/format';

export function SignupForm({ onSuccess }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const usernameValid = form.username.trim().length >= 3;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const passwordValid = form.password.length >= 8;
  const confirmValid = form.password === form.confirm && form.confirm.length > 0;
  const canSubmit = usernameValid && emailValid && passwordValid && confirmValid && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/signup', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.info('Account created', 'We sent a verification email (check the server console). You can log in while it is pending.');
      await login(form.email.trim(), form.password);
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
        <FieldLabel>Username</FieldLabel>
        <Input
          name="username"
          autoComplete="username"
          placeholder="maya"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          required
        />
        {form.username && !usernameValid ? <FieldError>At least 3 characters.</FieldError> : null}
        <FieldDescription>Letters, numbers and underscores only.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        {form.email && !emailValid ? <FieldError>Enter a valid email.</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel>Password</FieldLabel>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        {form.password && !passwordValid ? <FieldError>At least 8 characters.</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel>Confirm password</FieldLabel>
        <Input
          name="confirm"
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

      <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0" />
        Signing up emails a verification link to the server console (demo mock). You can sign in before verifying.
      </p>

      <Button type="submit" loading={submitting} disabled={!canSubmit}>
        Create account
      </Button>
    </form>
  );
}