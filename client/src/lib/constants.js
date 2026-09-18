export const CATEGORIES = [
  { value: 'UI/UX', badge: 'info' },
  { value: 'Integrations', badge: 'success' },
  { value: 'Performance', badge: 'warning' },
  { value: 'General', badge: 'outline' },
];

export const STATUS_FLOW = ['Under Review', 'Planned', 'In Progress', 'Completed'];

export const STATUS_BADGE = {
  'Under Review': 'outline',
  Planned: 'info',
  'In Progress': 'warning',
  Completed: 'success',
};

// Decorative "story-ring" color per status — cosmetic nod only.
export const STATUS_RING = {
  'Under Review': 'ring-zinc-400',
  Planned: 'ring-sky-500',
  'In Progress': 'ring-amber-500',
  Completed: 'ring-emerald-500',
};

export const SORTS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-discussed', label: 'Most discussed' },
];

export const ROADMAP_COLUMNS = ['Planned', 'In Progress', 'Completed'];

// The admin board also needs the intake lane so requests are never hidden
// before an administrator moves them onto the public roadmap.
export const ADMIN_COLUMNS = STATUS_FLOW;

export function badgeVariantForCategory(category) {
  const found = CATEGORIES.find((c) => c.value === category);
  return found ? found.badge : 'outline';
}