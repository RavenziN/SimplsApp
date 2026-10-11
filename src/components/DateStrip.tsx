import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  MONTH_NAMES_PT,
  WEEKDAY_SHORT_PT,
  formatDateToISO,
  isToday,
  getWeekDaysAround,
  getWeekOfMonth,
} from '../utils/dateUtils';
import { Task } from '../types';

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onOpenMonthView?: () => void;
  tasks: Task[];
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onSelectDate,
  onOpenMonthView,
  tasks,
}) => {
  const currentWeekDays = getWeekDaysAround(selectedDate);
  const monthName = MONTH_NAMES_PT[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();
  const isSelectedDateToday = isToday(formatDateToISO(selectedDate));
  const weekOfMonth = getWeekOfMonth(selectedDate);

  const hasTasksOnDate = (d: Date) => {
    const iso = formatDateToISO(d);
    return tasks.some((t) => t.date === iso);
  };

  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    onSelectDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    onSelectDate(next);
  };

  const handleGoToToday = () => {
    onSelectDate(new Date());
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] border-b border-[#E5E5E5] dark:border-[#222222] px-3 pt-3 pb-3 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header: Chevrons, Month/Year and Week subtitle */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrevWeek}
            aria-label="Semana anterior"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Centered Month & Small Week Indicator underneath */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenMonthView}
                className="flex items-center gap-1 text-base sm:text-lg font-bold text-[#0A0A0A] dark:text-white hover:opacity-75 transition-opacity cursor-pointer group"
              >
                <span>
                  {monthName} {year}
                </span>
                <span className="text-xs text-[#737373] dark:text-neutral-400 group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors">
                  ▾
                </span>
              </button>

              {!isSelectedDateToday && (
                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#F7F7F7] dark:bg-[#1A1A1A] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white rounded transition-colors cursor-pointer border border-[#E5E5E5] dark:border-[#333333]"
                >
                  Hoje
                </button>
              )}
            </div>

            {/* Small Week Label underneath Month, exactly as requested */}
            <span className="text-[11px] font-medium text-[#737373] dark:text-neutral-400 tracking-tight mt-0.5">
              {weekOfMonth}ª semana do mês
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextWeek}
            aria-label="Próxima semana"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-all cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 7-column grid displaying the FULL week without horizontal scroll/drag */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full text-center">
          {currentWeekDays.map((day) => {
            const isSelected =
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear();

            const isCurrentToday = isToday(formatDateToISO(day));
            const hasTasks = hasTasksOnDate(day);
            const weekdayName = WEEKDAY_SHORT_PT[day.getDay()];

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDate(day)}
                className={`w-full min-w-0 flex flex-col items-center justify-center py-2 sm:py-2.5 px-0.5 rounded-2xl transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] shadow-sm'
                    : 'bg-[#F7F7F7] dark:bg-[#141414] hover:bg-[#EAEAEA] dark:hover:bg-[#1F1F1F] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#262626]'
                }`}
              >
                {/* Day Number on top */}
                <span
                  className={`text-sm sm:text-base font-bold tracking-tight ${
                    isSelected
                      ? 'text-white dark:text-[#0A0A0A]'
                      : isCurrentToday
                      ? 'text-[#0A0A0A] dark:text-white underline underline-offset-2'
                      : 'text-[#0A0A0A] dark:text-white'
                  }`}
                >
                  {day.getDate()}
                </span>

                {/* Weekday abbreviation below */}
                <span
                  className={`text-[10px] sm:text-[11px] font-medium tracking-tight mt-0.5 ${
                    isSelected ? 'text-neutral-300 dark:text-neutral-400' : 'text-[#737373] dark:text-neutral-400'
                  }`}
                >
                  {weekdayName}
                </span>

                {/* Subtle task dot indicator */}
                {hasTasks && (
                  <span
                    className={`w-1 h-1 rounded-full mt-1 ${
                      isSelected ? 'bg-white dark:bg-[#0A0A0A]' : 'bg-[#0A0A0A] dark:bg-white'
                    }`}
                  />
                )}
                {!hasTasks && <span className="w-1 h-1 mt-1 opacity-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
