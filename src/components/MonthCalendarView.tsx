import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { Task } from '../types';
import {
  MONTH_NAMES_PT,
  WEEKDAY_SHORT_PT,
  formatDateToISO,
  isToday,
} from '../utils/dateUtils';
import { DayProgressSummary } from './DayProgressSummary';

interface MonthCalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  onOpenNewTask: () => void;
  onOpenTaskDetails: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  tasks,
  onOpenNewTask,
  onOpenTaskDetails,
  onToggleComplete,
}) => {
  const [viewDate, setViewDate] = useState<Date>(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = MONTH_NAMES_PT[month];

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days for this month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 is Sun, 1 is Mon...
  const startingEmptyCells = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

  const totalDays = lastDayOfMonth.getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingEmptyCells - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    days.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const selectedISO = formatDateToISO(selectedDate);
  const tasksOnSelectedDay = tasks.filter((t) => t.date === selectedISO);

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#121212] text-[#0A0A0A] dark:text-white pb-28 transition-colors">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
            {monthName} {year}
          </h2>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center mb-2">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((w) => (
            <span key={w} className="text-xs font-semibold text-[#737373] dark:text-neutral-400 py-1">
              {w}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center border-b border-[#E5E5E5] dark:border-[#262626] pb-6">
          {days.map(({ date, isCurrentMonth }, idx) => {
            const iso = formatDateToISO(date);
            const isSelected = iso === selectedISO;
            const isDateToday = isToday(iso);
            const dayTaskCount = tasks.filter((t) => t.date === iso).length;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectDate(date)}
                className={`h-11 rounded-full flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-sm'
                    : isCurrentMonth
                    ? 'hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white'
                    : 'text-neutral-300 dark:text-neutral-700'
                }`}
              >
                <span
                  className={`text-xs font-semibold ${
                    isSelected
                      ? 'text-white dark:text-[#0A0A0A]'
                      : isDateToday
                      ? 'text-[#0A0A0A] dark:text-white underline underline-offset-2'
                      : ''
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Dot for tasks */}
                {dayTaskCount > 0 && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white dark:bg-[#0A0A0A]' : 'bg-[#0A0A0A] dark:bg-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day task list */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Tarefas do dia
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenNewTask}
              className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova tarefa
            </button>
          </div>

          <DayProgressSummary tasks={tasksOnSelectedDay} />

          {tasksOnSelectedDay.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#737373] dark:text-neutral-400">
              Nenhuma tarefa para este dia.
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {tasksOnSelectedDay.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskDetails(task)}
                  className={`p-3 bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#0A0A0A] dark:hover:border-white transition-all ${
                    task.status === 'completed'
                      ? 'opacity-60 bg-[#F7F7F7] dark:bg-[#161616]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task);
                      }}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white dark:bg-white dark:border-white dark:text-[#0A0A0A]'
                          : 'border-[#737373] dark:border-neutral-500 hover:border-[#0A0A0A] dark:hover:border-white'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-bold text-[#0A0A0A] dark:text-white ${
                          task.status === 'completed'
                            ? 'line-through text-[#737373] dark:text-neutral-400'
                            : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                        {task.category && `${task.category} · `}
                        {task.hasSpecificTime
                          ? `${task.startTime} – ${task.endTime}`
                          : 'Sem horário'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
