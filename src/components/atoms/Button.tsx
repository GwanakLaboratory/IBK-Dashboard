import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-700 font-bold text-white hover:bg-blue-800',
  outline:
    'border border-slate-300 bg-white font-semibold text-slate-900 hover:bg-slate-50',
  ghost: 'font-semibold text-slate-600 hover:bg-slate-100',
};

const SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-lg px-3 text-xs',
  md: 'h-10 rounded-lg px-4 text-sm',
  lg: 'h-11 rounded-lg px-5 text-sm',
  icon: 'size-8 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className = '',
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-40 ${VARIANT_CLASS_NAMES[variant]} ${SIZE_CLASS_NAMES[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
