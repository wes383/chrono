import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import type { Schedule } from '../types/schedule';
import { canEdit, formatTime } from '../utils/dateUtils';

interface ScheduleCardProps {
  schedule: Schedule;
  isExpanded: boolean;
  onPress: (scheduleId: string) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function ScheduleCard({
  schedule,
  isExpanded,
  onPress,
  onEdit,
  onDelete,
  onToggleComplete,
}: ScheduleCardProps) {
  const isEditable = canEdit(schedule.date);
  const isCompleted = !!schedule.completed;

  const handleCardPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(schedule.id);
  };

  const handleDelete = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Alert.alert('Delete schedule', 'Are you sure you want to delete this schedule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(schedule.id) },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handleCardPress}
        style={({ pressed }) => [
          styles.card,
          isCompleted && styles.cardCompleted,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.content}>
            <Text style={[styles.title, isCompleted && styles.titleCompleted]}>{schedule.title}</Text>
            <Text style={[styles.time, isCompleted && styles.metaCompleted]}>
              {formatTime(schedule.startTime)}
              {schedule.endTime ? ` - ${formatTime(schedule.endTime)}` : ''}
            </Text>
            {schedule.description ? (
              <Text style={[styles.description, isCompleted && styles.metaCompleted]}>
                {schedule.description}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={styles.actions}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onToggleComplete(schedule.id);
            }}
            style={({ pressed }) => [
              styles.actionButton,
              styles.completeAction,
              pressed && styles.actionPressed,
            ]}
          >
            <Text style={styles.actionText}>{isCompleted ? 'Undo' : 'Done'}</Text>
          </Pressable>

          {isEditable ? (
            <>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onEdit(schedule);
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.editAction,
                  pressed && styles.actionPressed,
                ]}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteAction,
                  pressed && styles.actionPressed,
                ]}
              >
                <Text style={styles.actionText}>Delete</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  cardCompleted: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  cardPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  titleCompleted: {
    color: '#166534',
    textDecorationLine: 'line-through',
  },
  time: {
    fontSize: 14,
    color: '#4b5563',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  metaCompleted: {
    color: '#15803d',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  completeAction: {
    backgroundColor: '#16a34a',
  },
  editAction: {
    backgroundColor: '#2563eb',
  },
  deleteAction: {
    backgroundColor: '#dc2626',
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
