import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserMenuProps {
  onLogout: () => void;
}

export function UserMenu({ onLogout }: UserMenuProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title="Sign out"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
