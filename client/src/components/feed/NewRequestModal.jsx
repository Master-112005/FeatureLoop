import { useEffect, useMemo, useState } from 'react';
import { AlertCircleIcon, LightbulbIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogDescription, DialogPanel, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectPopup } from '@/components/ui/select';
import api from '@/api/axiosInstance';
import { CATEGORIES } from '@/lib/constants';
import { formatError } from '@/lib/format';

const INITIAL = { title: '', description: '', category: '' };

export function NewRequestModal({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validTitle = useMemo(() => form.title.trim().length >= 6, [form.title]);
  const validDescription = useMemo(() => form.description.trim().length >= 20, [form.description]);
  const canSubmit = validTitle && validDescription && form.category && !submitting;

  useEffect(() => {
    if (!open) {
      setForm(INITIAL);
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/requests', {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
      });
      onCreated?.(data.request);
      onOpenChange(false);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Submit a feature request</DialogTitle>
          <DialogDescription>
            Describe what you want — what problem it solves and how you'd use it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="contents">
          <DialogPanel className="space-y-4">
            <Field>
              <FieldLabel>
                Title
                <span className="text-muted-foreground/60">
                  {' '}
                  ({form.title.trim().length}/80)
                </span>
              </FieldLabel>
              <Input
                name="title"
                maxLength={80}
                placeholder="Dark mode toggle"
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
              />
              {form.title && !validTitle ? (
                <FieldError>{form.title.trim().length >= 2 ? 'At least 6 characters.' : 'Title is too short.'}</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                name="description"
                rows={4}
                minLength={20}
                maxLength={1500}
                placeholder="What problem does this solve? Any details help…"
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
              />
              {form.description && !validDescription ? (
                <FieldError>At least 20 characters.</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select value={form.category} onValueChange={set('category')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectPopup className="z-50">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          </DialogPanel>

          {error ? (
            <p className="mx-6 mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={!canSubmit}>
              <LightbulbIcon />
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}