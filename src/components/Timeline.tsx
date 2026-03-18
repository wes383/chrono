import { ScheduleCard } from './ScheduleCard';
import type { Schedule } from '../types/schedule';
import { sortByTime } from '../utils/dateUtils';

interface TimelineProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function Timeline({ schedules, onEdit, onDelete, onToggleComplete }: TimelineProps) {
  const sortedSchedules = sortByTime(schedules);

  if (sortedSchedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No schedules yet</h3>
        <p className="text-gray-500">Add your first schedule to get started</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main timeline line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {sortedSchedules.map((schedule) => (
          <div key={schedule.id} className="relative flex items-start gap-4">
            {/* Timeline node */}
            <div className="relative flex flex-col items-center shrink-0">
              <div className="w-10 h-10 flex items-center justify-center bg-white z-10">
                <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                  schedule.completed ? 'bg-green-500' : 'bg-blue-500'
                }`} />
              </div>
            </div>
            
            {/* Schedule card */}
            <div className="flex-1 pt-0.5">
              <ScheduleCard
                schedule={schedule}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
