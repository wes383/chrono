import dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';

export function getToday(): string {
  return dayjs().format(DATE_FORMAT);
}

export function formatDate(date: string): string {
  return dayjs(date).format('MMM D, YYYY');
}

export function formatTime(time: string): string {
  return dayjs(`2000-01-01 ${time}`).format('HH:mm');
}

export function isToday(date: string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isTomorrow(date: string): boolean {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
}

export function isYesterday(date: string): boolean {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
}

export function canEdit(date: string): boolean {
  return isToday(date) || isTomorrow(date);
}

export function sortByTime<T extends { startTime: string }>(schedules: T[]): T[] {
  return [...schedules].sort((a, b) => {
    const timeA = dayjs(`2000-01-01 ${a.startTime}`);
    const timeB = dayjs(`2000-01-01 ${b.startTime}`);
    return timeA.valueOf() - timeB.valueOf();
  });
}
