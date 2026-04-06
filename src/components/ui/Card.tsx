import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'navy' | 'gold-accent';
}

export function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  const base = 'rounded-xl p-6';
  const variants = {
    default: 'bg-white shadow-sm border border-slate-100',
    bordered: 'bg-white border border-slate-200',
    navy: 'bg-navy text-white',
    'gold-accent': 'bg-white border-l-4 border-l-gold shadow-sm',
  };

  return (
    <div className={[base, variants[variant], className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['mb-4', className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={['text-lg font-semibold text-slate-900', className].join(' ')} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
