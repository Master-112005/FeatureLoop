import { CategoryPill } from '@/components/feed/CategoryPill';
import { CATEGORIES } from '@/lib/constants';

export function CategoryBar({ category, onCategoryChange }) {
  const showAll = !category;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" onClick={() => onCategoryChange(null)} className="outline-none">
        <CategoryPill category="General" active={showAll} onClick={() => {}} />
      </button>
      <span className="text-sm text-muted-foreground/60">·</span>
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onCategoryChange(category === c.value ? null : c.value)}
          className="outline-none"
        >
          <CategoryPill category={c.value} active={category === c.value} onClick={() => {}} />
        </button>
      ))}
    </div>
  );
}