import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import { Timeline } from './components/Timeline';
import { DateSwitcher } from './components/DateSwitcher';
import { Modal } from './components/Modal';
import { ScheduleForm } from './components/ScheduleForm';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import type { Schedule } from './types/schedule';
import { canEdit } from './utils/dateUtils';

function AppContent() {
  const { user, currentDate, setCurrentDate, addSchedule, updateSchedule, deleteSchedule, toggleComplete, getSchedulesByDate, schedules } = useSchedule();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const currentSchedules = getSchedulesByDate(currentDate);
  const isEditable = canEdit(currentDate);

  const datesWithSchedules = Array.from(new Set(schedules.map(s => s.date)));

  const handleAdd = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteSchedule(id);
    }
  };

  const handleSubmit = (data: Omit<Schedule, 'id'>) => {
    if (editingSchedule) {
      updateSchedule({ ...data, id: editingSchedule.id });
    } else {
      addSchedule(data);
    }
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative w-full">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Chrono</h1>
              {user && (
                <button
                  onClick={handleLogout}
                  className="group hidden sm:flex items-center w-48 text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="group-hover:hidden truncate text-left">{user.email}</span>
                  <span className="hidden group-hover:block text-left">Log out</span>
                </button>
              )}
            </div>
            {user && (
              <button
                onClick={isEditable ? handleAdd : undefined}
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                  isEditable
                    ? 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
                    : 'invisible'
                }`}
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Schedule</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <DateSwitcher currentDate={currentDate} onChange={setCurrentDate} datesWithSchedules={datesWithSchedules} />
        </div>

        {!isEditable && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-amber-800 text-sm font-medium">View-only</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <Timeline
            schedules={currentSchedules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleComplete={toggleComplete}
          />
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
      >
        <ScheduleForm
          schedule={editingSchedule}
          date={currentDate}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

function AuthWrapper() {
  const { user, loading } = useSchedule();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={() => {}} />;
  }

  return <AppContent />;
}

function App() {
  return (
    <ScheduleProvider>
      <AuthWrapper />
    </ScheduleProvider>
  );
}

export default App;
