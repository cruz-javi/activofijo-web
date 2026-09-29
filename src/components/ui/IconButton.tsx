import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'children'> {
  label: string;
  icon: ReactNode;
  variant?: 'secondary' | 'ghost' | 'destructive';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, variant = 'secondary', className, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size="sm"
      title={label}
      aria-label={label}
      className={cn('w-8 px-0', className)}
      {...props}
    >
      {icon}
    </Button>
  ),
);
IconButton.displayName = 'IconButton';
