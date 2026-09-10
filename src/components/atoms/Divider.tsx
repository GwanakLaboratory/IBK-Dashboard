type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

export function Divider({
  orientation = 'vertical',
  className = '',
}: DividerProps) {
  const orientationClassName =
    orientation === 'vertical' ? 'h-3 w-px' : 'h-px w-full';

  return (
    <span
      className={`shrink-0 bg-gray-200 ${orientationClassName} ${className}`}
    />
  );
}
