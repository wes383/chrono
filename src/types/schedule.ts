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
