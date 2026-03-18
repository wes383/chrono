import dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';

export function getToday(): string {
  return dayjs().format(DATE_FORMAT);
}

export function getTomorrow(): string {
  return dayjs().add(1, 'day').format(DATE_FORMAT);
}

export function getYesterday(): string {
  return dayjs().subtract(1, 'day').format(DATE_FORMAT);
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

export function isHistorical(date: string): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

export function canEdit(date: string): boolean {
  return isToday(date) || isTomorrow(date);
}

export function addDays(date: string, days: number): string {
  return dayjs(date).add(days, 'day').format(DATE_FORMAT);
}

export function subtractDays(date: string, days: number): string {
  return dayjs(date).subtract(days, 'day').format(DATE_FORMAT);
}

export function sortByTime<T extends { startTime: string }>(schedules: T[]): T[] {
  return [...schedules].sort((a, b) => {
    const timeA = dayjs(`2000-01-01 ${a.startTime}`);
    const timeB = dayjs(`2000-01-01 ${b.startTime}`);
    return timeA.valueOf() - timeB.valueOf();
  });
}

export function getCurrentTimePosition(): number {
  const now = dayjs();
  const minutesSinceMidnight = now.hour() * 60 + now.minute();
  return (minutesSinceMidnight / 1440) * 100;
}
