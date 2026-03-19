import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Schedule } from '../types/schedule';

export interface ScheduleContextType {
  schedules: Schedule[];
  currentDate: string;
  user: User | null;
  session: Session | null;
  loading: boolean;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (schedule: Schedule) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setCurrentDate: (date: string) => void;
  getSchedulesByDate: (date: string) => Schedule[];
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);
