import { useState, useEffect } from 'react';
import type { Schedule, ScheduleFormData } from '../types/schedule';

interface ScheduleFormProps {
  schedule?: Schedule | null;
  date: string;
  onSubmit: (data: Omit<Schedule, 'id'>) => void;
  onCancel: () => void;
}

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

export function ScheduleForm({ schedule, date, onSubmit, onCancel }: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleFormData, string>>>({});

  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime || '',
        description: schedule.description || '',
      });
    }
  }, [schedule]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ScheduleFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > TITLE_MAX_LENGTH) {
      newErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or less`;
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (formData.endTime && formData.startTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.description.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title: formData.title.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime || undefined,
        description: formData.description.trim() || undefined,
        date,
      });
    }
  };

  const handleChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs ${formData.title.length > TITLE_MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
            {formData.title.length}/{TITLE_MAX_LENGTH}
          </span>
        </div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={TITLE_MAX_LENGTH}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter schedule title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <span className={`text-xs ${formData.description.length > DESCRIPTION_MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
            {formData.description.length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={DESCRIPTION_MAX_LENGTH}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter description"
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          {schedule ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
}
