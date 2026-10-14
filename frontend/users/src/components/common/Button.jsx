import { cn } from '../../utils/cn';

/**
 * Reusable Button component following UI/UX guidelines.
 * Props: size ('sm' | 'md' | 'lg'), variant, iconOnly, className, ...rest
 */
export default function Button({
  size = 'md',
  variant = 'primary',
  iconOnly = false,
  className = '',
  children,
  ...rest
}) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: iconOnly ? 'w-8 h-8' : 'h-9 px-4 text-sm',
    md: iconOnly ? 'w-12 h-12' : 'h-12 px-6 text-base font-bold',
    lg: iconOnly ? 'w-14 h-14' : 'h-14 px-10 text-lg font-bold',
  };

  const variantClasses = {
    primary:
      'bg-[#fa2d48] hover:bg-[#e0223e] text-white shadow-lg hover:shadow-[0_0_20px_rgba(250,45,72,0.3)] hover:scale-105',
    secondary:
      'bg-transparent border border-[#4d4d4d] hover:border-white text-white',
    white: 'bg-white hover:bg-gray-100 text-black',
    dark: 'bg-[#232323] hover:bg-[#2a2a2a] text-white',
    ghost: 'bg-transparent hover:bg-[#1a1a1a] text-[#a7a7a7] hover:text-white',
    glass:
      'bg-black/70 backdrop-blur-md hover:bg-[#282828] text-white border border-white/10',
  };

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
