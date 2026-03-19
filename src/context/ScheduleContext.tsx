import { useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Schedule } from '../types/schedule';
import { supabase } from '../lib/supabase';
import { getToday } from '../utils/dateUtils';
import { ScheduleContext } from './ScheduleShared';

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

  async function loadSchedules(nextUser: User) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', nextUser.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Failed to load schedules:', error);
        setSchedules([]);
        return;
      }

      setSchedules((data ?? []).map(mapDbToSchedule));
    } catch (error) {
      console.error('Unexpected error while loading schedules:', error);
      setSchedules([]);
    }
  }

  useEffect(() => {
    const syncAuthState = (nextSession: Session | null) => {
      const nextUser = nextSession?.user ?? null;

      setSession(nextSession);
      setUser(nextUser);
      setLoading(false);

      if (nextUser) {
        void loadSchedules(nextUser);
      } else {
        setSchedules([]);
      }
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      syncAuthState(session);
    }).catch((error) => {
      console.error('Failed to restore session:', error);
      setSession(null);
      setUser(null);
      setSchedules([]);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
