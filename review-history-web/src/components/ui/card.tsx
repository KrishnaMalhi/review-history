import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-border/80 bg-white shadow-sm hover:shadow-md transition-shadow duration-300', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn('border-b border-border px-6 py-4', className)}>{children}</div>;
}

export function CardContent({ className, children }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps) {
  return <div className={cn('border-t border-border px-6 py-3', className)}>{children}</div>;
}
