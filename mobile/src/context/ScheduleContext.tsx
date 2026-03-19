import { useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Schedule } from '../types/schedule';
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

    supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      syncAuthState(nextSession);
    }).catch((error) => {
      console.error('Failed to restore session:', error);
      setSession(null);
      setUser(null);
      setSchedules([]);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncAuthState(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = user?.id;

    if (!userId) {
      return;
    }

    const channel = supabase
      .channel(`schedules-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          try {
            const { data, error } = await supabase
              .from('schedules')
              .select('*')
              .eq('user_id', userId)
              .order('date', { ascending: true });

            if (error) {
              console.error('Failed to refresh schedules from realtime event:', error);
              return;
            }

            setSchedules((data ?? []).map(mapDbToSchedule));
          } catch (error) {
            console.error('Unexpected realtime refresh error:', error);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const addSchedule = async (schedule: Omit<Schedule, 'id'>) => {
    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert({
        title: schedule.title,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
        description: schedule.description,
        date: schedule.date,
        completed: schedule.completed ?? false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add schedule:', error);
      return;
    }

    setSchedules((prev) => [...prev, mapDbToSchedule(data)]);
  };

  const updateSchedule = async (schedule: Schedule) => {
    const { error } = await supabase
      .from('schedules')
      .update({
        title: schedule.title,
        start_time: schedule.startTime,
        end_time: schedule.endTime ?? null,
        description: schedule.description ?? null,
        completed: schedule.completed ?? false,
      })
      .eq('id', schedule.id);

    if (error) {
      console.error('Failed to update schedule:', error);
      return;
    }

    setSchedules((prev) => prev.map((item) => (item.id === schedule.id ? schedule : item)));
  };

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase.from('schedules').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete schedule:', error);
      return;
    }

    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleComplete = async (id: string) => {
    const schedule = schedules.find((item) => item.id === id);

    if (!schedule) {
      return;
    }

    const newCompleted = !schedule.completed;
    const { error } = await supabase.from('schedules').update({ completed: newCompleted }).eq('id', id);

    if (error) {
      console.error('Failed to toggle schedule completion:', error);
      return;
    }

    setSchedules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: newCompleted } : item))
    );
  };

  const getSchedulesByDate = (date: string) => schedules.filter((item) => item.date === date);

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
