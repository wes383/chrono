import { Pencil, Trash2, Clock, Check } from 'lucide-react';
import type { Schedule } from '../types/schedule';
import { formatTime, canEdit } from '../utils/dateUtils';

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function ScheduleCard({ schedule, onEdit, onDelete, onToggleComplete }: ScheduleCardProps) {
  const isEditable = canEdit(schedule.date);
  const hasEndTime = !!schedule.endTime;
  const isCompleted = schedule.completed;

  return (
    <div className={`relative rounded-xl border p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow ${
      isCompleted 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base sm:text-lg leading-tight ${
            isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
          }`}>
            {schedule.title}
          </h3>
          
          <div className={`flex items-center gap-1.5 mt-1 text-sm ${
            isCompleted ? 'text-green-600' : 'text-gray-600'
          }`}>
            <Clock size={14} className="shrink-0" />
            <span>
              {formatTime(schedule.startTime)}
              {hasEndTime && ` - ${formatTime(schedule.endTime!)}`}
            </span>
          </div>

          {schedule.description && (
            <p className={`mt-2 text-sm line-clamp-2 ${
              isCompleted ? 'text-green-600' : 'text-gray-600'
            }`}>
              {schedule.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 -mr-1 sm:-mr-2">
          <button
            onClick={() => onToggleComplete(schedule.id)}
            className={`min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg transition-colors ${
              isCompleted
                ? 'text-green-600 hover:text-green-700 hover:bg-green-100'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Check size={18} />
          </button>
          
          {isEditable && (
            <>
              <button
                onClick={() => onEdit(schedule)}
                className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => onDelete(schedule.id)}
                className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
