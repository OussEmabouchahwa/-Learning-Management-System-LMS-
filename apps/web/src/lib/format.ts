const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

function toDate(d: Date | string): Date {
  return typeof d === 'string' ? new Date(d) : d;
}

/** e.g. "Mon 2 Nov" */
export function formatDate(d: Date | string): string {
  const date = toDate(d);
  const day = DAY_NAMES[date.getDay()];
  const month = MONTH_NAMES[date.getMonth()];
  return `${day} ${date.getDate()} ${month}`;
}

/** e.g. "Mon 2 Nov, 18:00" */
export function formatDateTime(d: Date | string): string {
  const date = toDate(d);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(date)}, ${hh}:${mm}`;
}

type RelativeDue = { label: string; variant: 'soon' | 'overdue' | 'neutral' };

/** "In 2 days" (soon ≤3), "Overdue" (past), "Wed" (4–7 days), date string if further */
export function formatRelativeDue(d: Date | string): RelativeDue {
  const date = toDate(d);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Overdue', variant: 'overdue' };
  }
  if (diffDays <= 3) {
    const dayWord = diffDays === 1 ? 'day' : 'days';
    return { label: diffDays === 0 ? 'Today' : `In ${diffDays} ${dayWord}`, variant: 'soon' };
  }
  if (diffDays <= 7) {
    return { label: DAY_NAMES[date.getDay()], variant: 'neutral' };
  }
  return { label: formatDate(date), variant: 'neutral' };
}

/** e.g. "12 minutes", "1 hour 5 minutes" */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  const hourPart = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  if (minutes === 0) return hourPart;
  return `${hourPart} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

/** e.g. "58%" */
export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

/** e.g. "86.4 out of 100" */
export function formatGrade(score: number, max: number): string {
  const rounded = Math.round(score * 10) / 10;
  return `${rounded} out of ${max}`;
}
