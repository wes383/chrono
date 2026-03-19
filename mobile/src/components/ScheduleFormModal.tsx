import { useState } from 'react';
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Schedule, ScheduleFormData } from '../types/schedule';

interface ScheduleFormModalProps {
  date: string;
  schedule?: Schedule | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Schedule, 'id'>) => Promise<void>;
}

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

function getInitialFormData(schedule?: Schedule | null): ScheduleFormData {
  return {
    title: schedule?.title ?? '',
    startTime: normalizeTimeValue(schedule?.startTime ?? ''),
    endTime: normalizeTimeValue(schedule?.endTime ?? ''),
    description: schedule?.description ?? '',
  };
}

function normalizeTimeValue(value: string): string {
  if (!value) {
    return '';
  }

  return value.slice(0, 5);
}

function isValidTimeValue(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function parseTimeValue(value: string): Date {
  const date = new Date();
  const normalized = normalizeTimeValue(value);
  const [hours, minutes] = normalized ? normalized.split(':').map(Number) : [9, 0];

  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

function formatTimeValue(date: Date): string {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function ScheduleFormModal({
  date,
  schedule,
  visible,
  onClose,
  onSubmit,
}: ScheduleFormModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [formData, setFormData] = useState<ScheduleFormData>(getInitialFormData(schedule));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [actionsHeight, setActionsHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [pickerField, setPickerField] = useState<'startTime' | 'endTime' | null>(null);

  const handleChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  };

  const validate = () => {
    if (!formData.title.trim()) {
      setError('Title is required.');
      return false;
    }

    if (!formData.startTime) {
      setError('Start time is required.');
      return false;
    }

    if (!isValidTimeValue(formData.startTime)) {
      setError('Start time must be a valid 24-hour time.');
      return false;
    }

    if (formData.endTime && !isValidTimeValue(formData.endTime)) {
      setError('End time must be a valid 24-hour time.');
      return false;
    }

    if (formData.endTime && formData.endTime <= formData.startTime) {
      setError('End time must be after the start time.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);

    await onSubmit({
      title: formData.title.trim().slice(0, TITLE_MAX_LENGTH),
      startTime: formData.startTime,
      endTime: formData.endTime || undefined,
      description: formData.description.trim().slice(0, DESCRIPTION_MAX_LENGTH) || undefined,
      date,
      completed: schedule?.completed ?? false,
    });

    setSubmitting(false);
  };

  const maxSheetHeight = windowHeight * 0.88;
  const resolvedSheetHeight = Math.min(
    maxSheetHeight,
    headerHeight + actionsHeight + contentHeight + insets.bottom
  );

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  const handleActionsLayout = (event: LayoutChangeEvent) => {
    setActionsHeight(event.nativeEvent.layout.height);
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate || !pickerField) {
      setPickerField(null);
      return;
    }

    handleChange(pickerField, formatTimeValue(selectedDate));

    if (Platform.OS === 'android') {
      setPickerField(null);
    }
  };

  return (
    <Modal
      animationType="slide"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -insets.bottom}
          style={[styles.sheetWrap, { paddingBottom: insets.bottom }]}
        >
          <View style={[styles.sheet, { height: resolvedSheetHeight || undefined, maxHeight: maxSheetHeight }]}>
            <View onLayout={handleHeaderLayout} style={styles.header}>
              <Text style={styles.title}>{schedule ? 'Edit Schedule' : 'Add Schedule'}</Text>
              <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.content}
              onContentSizeChange={(_width, height) => setContentHeight(height)}
            >
              <View style={styles.field}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  maxLength={TITLE_MAX_LENGTH}
                  onChangeText={(value) => handleChange('title', value)}
                  placeholder="Enter schedule title"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={formData.title}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.field, styles.flexField]}>
                  <Text style={styles.label}>Start Time</Text>
                  <View style={styles.timeInputWrap}>
                    <Pressable
                      onPress={() => setPickerField('startTime')}
                      style={({ pressed }) => [styles.input, styles.timeInput, styles.timeField, pressed && styles.pressed]}
                    >
                      <Text style={formData.startTime ? styles.timeValue : styles.placeholderText}>
                        {normalizeTimeValue(formData.startTime) || '09:00'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPickerField('startTime')}
                      style={({ pressed }) => [styles.timePickerButton, pressed && styles.pressed]}
                    >
                      <Feather color="#6b7280" name="clock" size={18} />
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.field, styles.flexField]}>
                  <Text style={styles.label}>End Time</Text>
                  <View style={styles.timeInputWrap}>
                    <Pressable
                      onPress={() => setPickerField('endTime')}
                      style={({ pressed }) => [styles.input, styles.timeInput, styles.timeField, pressed && styles.pressed]}
                    >
                      <Text style={formData.endTime ? styles.timeValue : styles.placeholderText}>
                        {normalizeTimeValue(formData.endTime) || '10:00'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPickerField('endTime')}
                      style={({ pressed }) => [styles.timePickerButton, pressed && styles.pressed]}
                    >
                      <Feather color="#6b7280" name="clock" size={18} />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  multiline
                  numberOfLines={4}
                  onChangeText={(value) => handleChange('description', value)}
                  placeholder="Add a short note"
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={formData.description}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>

            {pickerField ? (
              <DateTimePicker
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour
                mode="time"
                onChange={handleTimeChange}
                value={parseTimeValue(formData[pickerField])}
              />
            ) : null}

            <View onLayout={handleActionsLayout} style={styles.actionsWrap}>
              <View style={styles.actions}>
                <Pressable onPress={onClose} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={submitting}
                  onPress={handleSubmit}
                  style={({ pressed }) => [styles.primaryButton, (pressed || submitting) && styles.pressed]}
                >
                  <Text style={styles.primaryButtonText}>{schedule ? 'Update' : 'Add'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  sheetWrap: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#ffffff',
  },
  formScroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 8,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 88,
  },
  timeInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
  },
  timeField: {
    justifyContent: 'center',
  },
  timePickerButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    backgroundColor: '#ffffff',
  },
  timeValue: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  error: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  actionsWrap: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
});
