import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Schedule } from '../types/schedule';

export interface ScheduleContextType {
  schedules: Schedule[];
  currentDate: string;
  user: User | null;
  session: Session | null;
  loading: boolean;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;
  toggleComplete: (id: string) => void;
  setCurrentDate: (date: string) => void;
  getSchedulesByDate: (date: string) => Schedule[];
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);
