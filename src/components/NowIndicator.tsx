import { useState, useEffect } from 'react';
import { getCurrentTimePosition } from '../utils/dateUtils';

interface NowIndicatorProps {
  isVisible: boolean;
}

export function NowIndicator({ isVisible }: NowIndicatorProps) {
  const [position, setPosition] = useState(getCurrentTimePosition());

  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      setPosition(getCurrentTimePosition());
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
      style={{ top: `${position}%` }}
    >
      <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm shrink-0" />
      <div className="flex-1 h-0.5 bg-red-500" />
      <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded shadow-sm shrink-0">
        Now
      </div>
    </div>
  );
}
