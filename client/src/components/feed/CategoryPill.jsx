import { Badge } from '@/components/ui/badge';
import { badgeVariantForCategory } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function CategoryPill({ category, onClick, active }) {
  if (!onClick) {
    return (
      <Badge variant={badgeVariantForCategory(category)} size="sm">
        {category}
      </Badge>
    );
  }
  return (
    <button type="button" onClick={onClick} className="outline-none">
      <Badge
        variant={active ? badgeVariantForCategory(category) : 'outline'}
        size="sm"
        render={
          <span
            className={cn(
              'cursor-pointer transition-transform hover:scale-105 active:scale-95',
              active && 'ring-1 ring-ring'
            )}
          />
        }
      >
        {category}
      </Badge>
    </button>
  );
}