import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE } from '@/lib/constants';

export function StatusBadge({ status, size = 'sm' }) {
  return (
    <Badge variant={STATUS_BADGE[status] || 'outline'} size={size}>
      {status}
    </Badge>
  );
}