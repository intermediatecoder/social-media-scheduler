import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupPostsByDay<T extends { scheduledAt: string }>(posts: T[]): [string, T[]][] {
  const groups: Record<string, T[]> = {};

  for (const post of posts) {
    const date = parseISO(post.scheduledAt);
    let label: string;
    if (isToday(date)) {
      label = 'Today';
    } else if (isTomorrow(date)) {
      label = 'Tomorrow';
    } else {
      label = format(date, 'MMMM d, yyyy');
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(post);
  }

  // Sort: Today first, Tomorrow second, then chronological dates
  const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Tomorrow') return -1;
    if (b === 'Tomorrow') return 1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return sortedEntries;
}

export function formatLocalTime(utcString: string): string {
  const date = parseISO(utcString);
  return format(date, 'h:mm a');
}

export function formatLocalDateTime(utcString: string): string {
  const date = parseISO(utcString);
  return format(date, 'MMM d, h:mm a');
}
