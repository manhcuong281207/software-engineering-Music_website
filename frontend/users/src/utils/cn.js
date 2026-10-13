/**
 * Simple className merger utility (lightweight alternative to clsx/cn)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
