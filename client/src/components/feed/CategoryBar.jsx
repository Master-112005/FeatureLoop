import { CategoryPill } from '@/components/feed/CategoryPill';
import { CATEGORIES } from '@/lib/constants';

export function CategoryBar({ category, onCategoryChange }) {
  const showAll = !category;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onCategoryChange(null)}
        className={`rounded-md border px-2 py-1 text-xs transition-colors ${
          showAll
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={showAll}
      >
        All
      </button>
      <span className="text-sm text-muted-foreground/60">·</span>
      {CATEGORIES.map((c) => (
        <CategoryPill
          key={c.value}
          category={c.value}
          active={category === c.value}
          onClick={() => onCategoryChange(category === c.value ? null : c.value)}
        />
      ))}
    </div>
  );
}