import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Shared formatters. Keep all currency/date/number formatting here so the whole
 * app is consistent (and locale changes happen in one place).
 */

export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** "12 Jun 2026" style. Accepts ISO string or Date. */
export function formatDate(date: string | Date, pattern = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

/** "3 hours ago" style. */
export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}
