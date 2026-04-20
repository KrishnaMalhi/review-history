import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-surface text-foreground/80 ring-1 ring-border/50',
  success: 'bg-primary-light text-primary-dark ring-1 ring-primary/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200/50',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
  accent: 'bg-accent-light text-accent-dark ring-1 ring-accent/20',
  navy: 'bg-navy/10 text-navy-light ring-1 ring-navy/20',
};

interface BadgeProps {
  variant?: keyof typeof badgeVariants;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
