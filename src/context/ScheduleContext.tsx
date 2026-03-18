import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { Schedule } from '../types/schedule';
import { supabase } from '../lib/supabase';
import { getToday } from '../utils/dateUtils';

interface ScheduleContextType {
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

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

function mapDbToSchedule(db: Record<string, unknown>): Schedule {
  return {
    id: db.id as string,
    title: db.title as string,
    startTime: db.start_time as string,
    endTime: db.end_time as string | undefined,
    description: db.description as string | undefined,
    date: db.date as string,
    completed: db.completed as boolean | undefined,
    user_id: db.user_id as string | undefined,
    created_at: db.created_at as string | undefined,
    updated_at: db.updated_at as string | undefined,
  };
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentDate, setCurrentDate] = useState(getToday());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadSchedules();
    } else {
      setSchedules([]);
    }
  }, [user]);

  const loadSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      setSchedules(data.map(mapDbToSchedule));
    }
  };

  const addSchedule = async (schedule: Omit<Schedule, 'id'>) => {
    if (!user) return;

    const dbSchedule = {
      title: schedule.title,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      description: schedule.description,
      date: schedule.date,
      completed: schedule.completed,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('schedules')
      .insert(dbSchedule)
      .select()
      .single();

    if (!error && data) {
      setSchedules((prev) => [...prev, mapDbToSchedule(data)]);
    }
  };

  const updateSchedule = async (schedule: Schedule) => {
    const { error } = await supabase
      .from('schedules')
      .update({
        title: schedule.title,
        start_time: schedule.startTime,
        end_time: schedule.endTime ?? null,
        description: schedule.description ?? null,
        completed: schedule.completed,
      })
      .eq('id', schedule.id);

    if (!error) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? schedule : s))
      );
    }
  };

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (!error) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const toggleComplete = async (id: string) => {
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) return;

    const newCompleted = !schedule.completed;

    const { error } = await supabase
      .from('schedules')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (!error) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, completed: newCompleted } : s))
      );
    }
  };

  const getSchedulesByDate = (date: string) => {
    return schedules.filter((s) => s.date === date);
  };

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        currentDate,
        user,
        session,
        loading,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        toggleComplete,
        setCurrentDate,
        getSchedulesByDate,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
