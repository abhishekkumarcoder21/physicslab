/**
 * Utility: merge class names (filters out falsy values).
 */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a percentage for display.
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
