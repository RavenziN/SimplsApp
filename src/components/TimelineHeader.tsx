import React from 'react';
import { Plus, Clock, CalendarDays } from 'lucide-react';

interface TimelineHeaderProps {
  onOpenNewTask: () => void;
  onOpenClock: () => void;
  onOpenCalendar: () => void;
  onGoHome: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  onOpenNewTask,
  onOpenClock,
  onOpenCalendar,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#222222] px-4 py-3 sm:px-6">
      <div className="max-w-2xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Left: Simpls Logo + Clock button */}
        <div className="flex items-center gap-3 justify-start">
          <button
            type="button"
            onClick={onGoHome}
            className="text-xl sm:text-2xl font-black tracking-tighter text-[#0A0A0A] dark:text-white select-none font-sans cursor-pointer"
          >
            Simpls
          </button>
          <button
            type="button"
            onClick={onOpenClock}
            aria-label="Relógio de Mesa"
            title="Relógio de Mesa"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#0A0A0A] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] active:scale-95 transition-all cursor-pointer border border-[#E5E5E5] dark:border-[#262626]"
          >
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Center: Plus button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onOpenNewTask}
            aria-label="Nova tarefa"
            className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center hover:bg-[#171717] dark:hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.4]" />
          </button>
        </div>

        {/* Right: Calendar view button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenCalendar}
            aria-label="Visualização Mensal"
            title="Calendário"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#0A0A0A] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] active:scale-95 transition-all cursor-pointer border border-[#E5E5E5] dark:border-[#262626]"
          >
            <CalendarDays className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
