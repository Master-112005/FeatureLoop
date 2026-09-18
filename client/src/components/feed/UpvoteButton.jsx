import { ArrowUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * The upvote control. An arrow/chevron + count — this is a
 * prioritization signal, not a heart.
 */
export function UpvoteButton({ voted, count, onClick, pending, size = 'sm' }) {
  return (
    <Button
      type="button"
      variant={voted ? 'default' : 'outline'}
      size={size}
      onClick={onClick}
      aria-pressed={voted}
      aria-label={voted ? `Remove upvote (${count})` : `Upvote (${count})`}
      className={cn(
        'gap-1.5',
        voted && 'font-semibold',
        pending && 'opacity-70'
      )}
    >
      <ArrowUpIcon className={cn(voted && 'scale-110')} />
      <span className="tabular-nums">{count}</span>
    </Button>
  );
}