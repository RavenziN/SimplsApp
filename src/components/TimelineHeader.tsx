import React from 'react';
import { Clock, CalendarDays } from 'lucide-react';

const iconButtonClass =
  'w-9 h-9 rounded-full flex items-center justify-center text-[#0A0A0A] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] active:scale-95 transition-all cursor-pointer border border-[#E5E5E5] dark:border-[#262626]';

interface TimelineHeaderProps {
  onOpenClock: () => void;
  onOpenCalendar: () => void;
  onGoHome: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  onOpenClock,
  onOpenCalendar,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#222222] px-4 py-3 sm:px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onGoHome}
          className="text-xl sm:text-2xl font-black tracking-tighter text-[#0A0A0A] dark:text-white select-none font-sans cursor-pointer"
        >
          Simpls
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenClock}
            aria-label="Relógio de Mesa"
            title="Relógio de Mesa"
            className={iconButtonClass}
          >
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={onOpenCalendar}
            aria-label="Calendário"
            title="Calendário"
            className={iconButtonClass}
          >
            <CalendarDays className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
