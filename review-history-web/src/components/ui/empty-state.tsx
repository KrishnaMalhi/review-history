import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
        <SearchX className="h-8 w-8 text-muted" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
