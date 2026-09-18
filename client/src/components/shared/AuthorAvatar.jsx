import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { STATUS_RING } from '@/lib/constants';
import { avatarHue, initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export function AuthorAvatar({ author, status, size = 'md', className }) {
  const name = author?.username || '?';
  const hue = avatarHue(name);

  const sizeClass = {
    xs: 'size-6 text-[10px]',
    sm: 'size-7 text-[11px]',
    md: 'size-9 text-xs',
    lg: 'size-12 text-sm',
  }[size];

  const avatar = (
    <Avatar className={cn(sizeClass, 'bg-background', className)}>
      {author?.avatarUrl ? (
        <AvatarImage src={author.avatarUrl} alt={name} />
      ) : null}
      <AvatarFallback
        className="font-semibold"
        style={{
          background: `hsl(${hue} 45% 92%)`,
          color: `hsl(${hue} 55% 35%)`,
        }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );

  if (!status) return avatar;

  // Decorative "story ring" around the avatar reflecting the item's status.
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full p-[2.5px] ring-2',
        STATUS_RING[status] || 'ring-transparent'
      )}
    >
      {avatar}
    </span>
  );
}