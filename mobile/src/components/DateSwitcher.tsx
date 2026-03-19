import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDate, isToday, isTomorrow, isYesterday } from '../utils/dateUtils';

interface DateSwitcherProps {
  currentDate: string;
  onChange: (date: string) => void;
  datesWithSchedules: string[];
}

export function DateSwitcher({ currentDate, onChange, datesWithSchedules }: DateSwitcherProps) {
  const getNextDateWithSchedule = (fromDate: string, direction: 'prev' | 'next'): string | null => {
    if (datesWithSchedules.length === 0) {
      return null;
    }

    const sortedDates = [...datesWithSchedules].sort();

    if (direction === 'next') {
      return sortedDates.find((date) => date > fromDate) ?? null;
    }

    for (let index = sortedDates.length - 1; index >= 0; index -= 1) {
      if (sortedDates[index] < fromDate) {
        return sortedDates[index];
      }
    }

    return null;
  };

  const handlePrevious = () => {
    if (isToday(currentDate) || isTomorrow(currentDate)) {
      onChange(dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD'));
      return;
    }

    const previousDate = getNextDateWithSchedule(currentDate, 'prev');
    if (previousDate) {
      onChange(previousDate);
    }
  };

  const handleNext = () => {
    if (isToday(currentDate) || isYesterday(currentDate)) {
      onChange(dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD'));
      return;
    }

    const nextDate = getNextDateWithSchedule(currentDate, 'next');
    if (nextDate) {
      onChange(nextDate);
    }
  };

  const label = isToday(currentDate)
    ? 'Today'
    : isTomorrow(currentDate)
      ? 'Tomorrow'
      : isYesterday(currentDate)
        ? 'Yesterday'
        : '';

  const hasPrevious = isToday(currentDate) || isTomorrow(currentDate) || !!getNextDateWithSchedule(currentDate, 'prev');
  const hasNext = isToday(currentDate) || isYesterday(currentDate) || !!getNextDateWithSchedule(currentDate, 'next');

  return (
    <View style={styles.container}>
      <Pressable
        disabled={!hasPrevious}
        onPress={handlePrevious}
        style={[styles.button, !hasPrevious && styles.buttonDisabled]}
      >
        <Feather color="#374151" name="chevron-left" size={28} />
      </Pressable>

      <View style={styles.center}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={styles.date}>{formatDate(currentDate)}</Text>
      </View>

      <Pressable
        disabled={!hasNext}
        onPress={handleNext}
        style={[styles.button, !hasNext && styles.buttonDisabled]}
      >
        <Feather color="#374151" name="chevron-right" size={28} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#ffffff',
  },
  button: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  center: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  date: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
