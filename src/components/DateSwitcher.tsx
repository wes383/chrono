import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, isToday, isTomorrow, isYesterday } from '../utils/dateUtils';
import dayjs from 'dayjs';

interface DateSwitcherProps {
  currentDate: string;
  onChange: (date: string) => void;
}

export function DateSwitcher({ currentDate, onChange }: DateSwitcherProps) {
  const handlePrevious = () => {
    const prevDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
    onChange(prevDate);
  };

  const handleNext = () => {
    const nextDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD');
    onChange(nextDate);
  };

  const getDisplayLabel = (date: string): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return '';
  };

  const displayLabel = getDisplayLabel(currentDate);

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <button
        onClick={handlePrevious}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}