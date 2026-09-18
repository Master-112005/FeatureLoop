import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { SORTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function SortTabs({ sort, onSortChange }) {
  return (
    <Tabs value={sort} onValueChange={onSortChange} className="w-fit">
      <TabsList className="grid w-fit grid-cols-3">
        {SORTS.map((s) => (
          <TabsTab key={s.value} value={s.value} className={cn('px-4')}>
            {s.label}
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  );
}