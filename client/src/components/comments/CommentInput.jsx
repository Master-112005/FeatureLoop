import { useState } from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function CommentInput({
  onSubmit,
  submitting = false,
  autoFocus = false,
  compact = false,
  placeholder = 'Add to the discussion…',
  submitLabel = 'Comment',
  value,
  onChange,
}) {
  const [internalContent, setInternalContent] = useState('');
  const isControlled = value !== undefined;

  const content = isControlled ? value : internalContent;
  const setContent = isControlled ? onChange : setInternalContent;

  const canSubmit = content.trim().length > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit(content.trim());
    if (!isControlled) setContent('');
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="relative">
        <Textarea
          rows={1}
          placeholder={placeholder}
          value={content}
          autoFocus={autoFocus}
          maxLength={1000}
          onChange={(e) => setContent(e.target.value)}
          className={cn('max-h-24 min-h-10 pr-12 text-sm', 'resize-none')}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          disabled={!canSubmit}
          loading={submitting}
          aria-label={submitLabel}
          className="absolute bottom-1.5 right-1.5 text-muted-foreground disabled:opacity-40"
        >
          {!submitting ? <SendIcon /> : null}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="flex flex-col items-end gap-2">
      <Textarea
        rows={2}
        placeholder={placeholder}
        value={content}
        autoFocus={autoFocus}
        maxLength={1000}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button type="submit" size="sm" disabled={!canSubmit} loading={submitting}>
        {!submitting ? <SendIcon /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}