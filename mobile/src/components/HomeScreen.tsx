import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useSchedule } from '../context/useSchedule';
import { canEdit, sortByTime } from '../utils/dateUtils';
import type { Schedule } from '../types/schedule';
import { DateSwitcher } from './DateSwitcher';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleFormModal } from './ScheduleFormModal';

export function HomeScreen() {
  const {
    user,
    currentDate,
    setCurrentDate,
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleComplete,
    getSchedulesByDate,
  } = useSchedule();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isLogoutConfirming, setIsLogoutConfirming] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSchedules = sortByTime(getSchedulesByDate(currentDate));
  const datesWithSchedules = Array.from(new Set(schedules.map((schedule) => schedule.date)));
  const isEditable = canEdit(currentDate);
  const userLabel = user?.email?.split('@')[0] ?? 'Account';

  const closeExpandedSchedule = () => {
    setExpandedScheduleId(null);
  };

  const cancelLogoutConfirmation = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    setIsLogoutConfirming(false);
  };

  const closeTransientUi = () => {
    closeExpandedSchedule();
    cancelLogoutConfirmation();
  };

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  const handleCardPress = (scheduleId: string) => {
    setExpandedScheduleId((current) => (current === scheduleId ? null : scheduleId));
  };

  const handleAdd = () => {
    closeTransientUi();
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    closeTransientUi();
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Omit<Schedule, 'id'>) => {
    if (editingSchedule) {
      await updateSchedule({ ...data, id: editingSchedule.id });
    } else {
      await addSchedule(data);
    }

    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  return (
    <Pressable onPress={closeTransientUi} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.userMenuWrap}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              closeExpandedSchedule();

              if (isLogoutConfirming) {
                cancelLogoutConfirmation();
                void supabase.auth.signOut();
                return;
              }

              setIsLogoutConfirming(true);
              logoutTimerRef.current = setTimeout(() => {
                logoutTimerRef.current = null;
                setIsLogoutConfirming(false);
              }, 3000);
            }}
            style={({ pressed }) => [styles.userChip, pressed && styles.pressed]}
          >
            <Text style={styles.userChipText}>{isLogoutConfirming ? 'Log out' : userLabel}</Text>
          </Pressable>
        </View>

        {isEditable ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              handleAdd();
            }}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText}>Add Schedule</Text>
          </Pressable>
        ) : (
          <View style={styles.addButtonPlaceholder} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={closeTransientUi}
      >
        <DateSwitcher currentDate={currentDate} datesWithSchedules={datesWithSchedules} onChange={setCurrentDate} />

        {!isEditable ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>This date is view-only.</Text>
          </View>
        ) : null}

        <View style={styles.timeline}>
          {currentSchedules.length > 0 ? (
            currentSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                isExpanded={expandedScheduleId === schedule.id}
                onDelete={deleteSchedule}
                onEdit={handleEdit}
                onPress={handleCardPress}
                onToggleComplete={toggleComplete}
                schedule={schedule}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No schedules yet</Text>
              <Text style={styles.emptyText}>Add your first schedule to get started.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ScheduleFormModal
        key={`${editingSchedule?.id ?? 'new'}-${currentDate}-${isModalOpen ? 'open' : 'closed'}`}
        date={currentDate}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
          cancelLogoutConfirmation();
        }}
        onSubmit={handleSubmit}
        schedule={editingSchedule}
        visible={isModalOpen}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  userMenuWrap: {
    flexDirection: 'row',
  },
  userChip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#e5e7eb',
  },
  userChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
  },
  addButtonPlaceholder: {
    width: 112,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  banner: {
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#fffbeb',
  },
  bannerText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  timeline: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
  },
  pressed: {
    opacity: 0.8,
  },
});
