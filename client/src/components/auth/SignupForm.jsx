import { useState } from 'react';
import { AlertCircleIcon, ShieldCheckIcon } from 'lucide-react';
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
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
    adminPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const usernameValid = form.username.trim().length >= 3;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const passwordValid = form.password.length >= 8;
  const confirmValid = form.password === form.confirm && form.confirm.length > 0;
  const adminPasswordValid = form.adminPassword.length > 0;
  const canSubmit =
    usernameValid &&
    emailValid &&
    passwordValid &&
    confirmValid &&
    adminPasswordValid &&
    !submitting;

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
        adminPassword: form.adminPassword,
      });
      toast.success('Account created', 'Your account has been verified by the administrator.');
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

      <Field>
        <FieldLabel>Admin authorization password</FieldLabel>
        <Input
          name="adminPassword"
          type="password"
          autoComplete="off"
          placeholder="Enter the password provided by the administrator"
          value={form.adminPassword}
          onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
          required
        />
        <FieldDescription className="flex items-start gap-1.5">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
          Required to create an account. No email verification is needed.
        </FieldDescription>
      </Field>

      <Button type="submit" loading={submitting} disabled={!canSubmit}>
        Create account
      </Button>
    </form>
  );
}