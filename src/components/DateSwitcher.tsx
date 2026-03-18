import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, isToday, isTomorrow, isYesterday } from '../utils/dateUtils';
import dayjs from 'dayjs';

interface DateSwitcherProps {
  currentDate: string;
  onChange: (date: string) => void;
  datesWithSchedules: string[];
}

export function DateSwitcher({ currentDate, onChange, datesWithSchedules }: DateSwitcherProps) {
  const getNextDateWithSchedule = (fromDate: string, direction: 'prev' | 'next'): string | null => {
    if (datesWithSchedules.length === 0) return null;
    
    const sortedDates = [...datesWithSchedules].sort();
    
    if (direction === 'next') {
      for (let i = 0; i < sortedDates.length; i++) {
        if (sortedDates[i] > fromDate) {
          return sortedDates[i];
        }
      }
      return null;
    } else {
      for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (sortedDates[i] < fromDate) {
          return sortedDates[i];
        }
      }
      return null;
    }
  };

  const handlePrevious = () => {
    if (isToday(currentDate)) {
      const prevDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
      onChange(prevDate);
    } else if (isTomorrow(currentDate)) {
      const prevDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
      onChange(prevDate);
    } else {
      const prevDateWithSchedule = getNextDateWithSchedule(currentDate, 'prev');
      if (prevDateWithSchedule) {
        onChange(prevDateWithSchedule);
      }
    }
  };

  const handleNext = () => {
    if (isToday(currentDate)) {
      const nextDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD');
      onChange(nextDate);
    } else if (isTomorrow(currentDate)) {
      const nextDateWithSchedule = getNextDateWithSchedule(currentDate, 'next');
      if (nextDateWithSchedule) {
        onChange(nextDateWithSchedule);
      }
    } else if (isYesterday(currentDate)) {
      // Yesterday can always go to Today
      const nextDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD');
      onChange(nextDate);
    } else {
      const nextDateWithSchedule = getNextDateWithSchedule(currentDate, 'next');
      if (nextDateWithSchedule) {
        onChange(nextDateWithSchedule);
      }
    }
  };

  const getDisplayLabel = (date: string): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return '';
  };

  const displayLabel = getDisplayLabel(currentDate);

  const hasPrevDate = (() => {
    if (isToday(currentDate)) return true;
    if (isTomorrow(currentDate)) return true;
    return !!getNextDateWithSchedule(currentDate, 'prev');
  })();
  
  const hasNextDate = (() => {
    if (isToday(currentDate)) return true;
    if (isTomorrow(currentDate)) {
      return !!getNextDateWithSchedule(currentDate, 'next');
    }
    if (isYesterday(currentDate)) return true; // Yesterday can always go to Today
    return !!getNextDateWithSchedule(currentDate, 'next');
  })();

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <button
        onClick={handlePrevious}
        disabled={!hasPrevDate}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="text-center">
        {displayLabel && (
          <p className="text-sm text-gray-500 font-medium">{displayLabel}</p>
        )}
        <p className="text-lg font-semibold text-gray-900">{formatDate(currentDate)}</p>
      </div>

      <button
        onClick={handleNext}
        disabled={!hasNextDate}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
