export interface Schedule {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  description?: string;
  date: string;
  completed?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleFormData {
  title: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface AppState {
  schedules: Schedule[];
  currentDate: string;
}

export type ScheduleAction =
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'SET_SCHEDULES'; payload: Schedule[] }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string };
