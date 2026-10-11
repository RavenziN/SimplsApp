import React, { useRef, useEffect, useState } from 'react';
import { Check, MoreVertical, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Task } from '../types';
import {
  timeStringToMinutes,
  getCurrentTimeMinutes,
  isToday,
  formatDateToISO,
} from '../utils/dateUtils';

interface VerticalTimelineProps {
  selectedDate: Date;
  tasks: Task[];
  startHour?: number;
  endHour?: number;
  onToggleComplete: (task: Task) => void;
  onOpenTaskDetails: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onEmptySlotClick: (timeStr: string) => void;
  onOpenNewTask: () => void;
}

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  selectedDate,
  tasks,
  startHour = 6,
  endHour = 23,
  onToggleComplete,
  onOpenTaskDetails,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onEmptySlotClick,
  onOpenNewTask,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);
  const [nowMinutes, setNowMinutes] = useState(getCurrentTimeMinutes());

  const selectedDateISO = formatDateToISO(selectedDate);
  const isSelectedToday = isToday(selectedDateISO);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMinutes(getCurrentTimeMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter tasks for this date
  const dayTasks = tasks.filter((t) => t.date === selectedDateISO);
  const scheduledTasks = dayTasks
    .filter((t) => t.hasSpecificTime)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));
  const unScheduledTasks = dayTasks.filter((t) => !t.hasSpecificTime);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.task-menu-container')) {
        setActiveMenuTaskId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const isInProgress = (task: Task) => {
    if (!isSelectedToday || task.status === 'completed' || !task.hasSpecificTime) return false;
    return nowMinutes >= timeStringToMinutes(task.startTime) && nowMinutes < timeStringToMinutes(task.endTime);
  };

  const isPast = (task: Task) =>
    isSelectedToday && task.status !== 'completed' && task.hasSpecificTime && nowMinutes >= timeStringToMinutes(task.endTime);

  // Index of the first scheduled task that starts after now; the "now" line goes right before it.
  const nowLineIndex = isSelectedToday
    ? (() => {
        const i = scheduledTasks.findIndex((t) => timeStringToMinutes(t.startTime) > nowMinutes);
        return i === -1 ? scheduledTasks.length : i;
      })()
    : -1;
  const nowLabel = `${String(Math.floor(nowMinutes / 60)).padStart(2, '0')}:${String(nowMinutes % 60).padStart(2, '0')}`;

  const menuItemClass =
    'w-full text-left px-3.5 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white cursor-pointer';

  const renderTask = (task: Task) => {
    const done = task.status === 'completed';
    const inProgress = isInProgress(task);
    const past = isPast(task);
    const subtitle = [task.category, task.description].filter(Boolean).join(' · ');

    return (
      <div
        key={task.id}
        onClick={() => onOpenTaskDetails(task)}
        className={`relative flex items-center gap-3 pl-3 pr-1.5 py-3 rounded-2xl border transition-all cursor-pointer ${
          inProgress
            ? 'border-[#0A0A0A] dark:border-white bg-white dark:bg-[#141414]'
            : 'border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#A3A3A3] dark:hover:border-neutral-500'
        } ${activeMenuTaskId === task.id ? 'z-30' : ''}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
          className={`w-6 h-6 shrink-0 rounded-full border-[1.5px] flex items-center justify-center transition-all cursor-pointer ${
            done
              ? 'bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white text-white dark:text-[#0A0A0A]'
              : 'border-[#BDBDBD] dark:border-neutral-600 hover:border-[#0A0A0A] dark:hover:border-white'
          }`}
        >
          {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-[15px] font-semibold tracking-tight truncate ${
                done ? 'line-through text-[#A3A3A3] dark:text-neutral-500' : 'text-[#0A0A0A] dark:text-white'
              }`}
            >
              {task.title}
            </h4>
            {inProgress && (
              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-[10px] font-bold">
                Agora
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {task.hasSpecificTime && (
          <span
            className={`shrink-0 text-right text-[11px] leading-tight font-mono tabular-nums ${
              past ? 'text-[#A3A3A3] dark:text-neutral-500' : 'text-[#525252] dark:text-neutral-300'
            }`}
          >
            {task.startTime}
            <br />
            <span className="text-[#A3A3A3] dark:text-neutral-500">{task.endTime}</span>
          </span>
        )}

        <div className="relative task-menu-container shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
            }}
            aria-label="Opções"
            className="p-1.5 rounded-lg text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#262626] transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {activeMenuTaskId === task.id && (
            <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-xl py-1.5 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuTaskId(null);
                  onToggleComplete(task);
                }}
                className={`${menuItemClass} font-semibold`}
              >
                {done ? 'Reabrir tarefa' : 'Marcar como concluída'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuTaskId(null);
                  onEditTask(task);
                }}
                className={menuItemClass}
              >
                Editar tarefa
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuTaskId(null);
                  onDuplicateTask(task);
                }}
                className={menuItemClass}
              >
                Duplicar tarefa
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuTaskId(null);
                  onDeleteTask(task);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-medium cursor-pointer"
              >
                Excluir tarefa
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const nowLine = (
    <div key="now-line" className="flex items-center gap-2 py-0.5" aria-label={`Agora, ${nowLabel}`}>
      <span className="text-[10px] font-bold font-mono tabular-nums text-red-600 dark:text-red-400">{nowLabel}</span>
      <div className="flex-1 h-px bg-red-600/70 dark:bg-red-400/70" />
    </div>
  );

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto bg-white dark:bg-[#0A0A0A] relative pb-32 select-none text-[#0A0A0A] dark:text-white"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 flex flex-col gap-6">
        {dayTasks.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F7F7F7] dark:bg-[#141414] flex items-center justify-center text-[#0A0A0A] dark:text-white mb-4">
              <CalendarIcon className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Seu dia está livre.</h3>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1 max-w-xs">
              Toque em + para adicionar sua primeira tarefa.
            </p>
            <button
              type="button"
              onClick={onOpenNewTask}
              className="mt-6 px-6 py-3 bg-[#0A0A0A] dark:bg-white hover:bg-[#171717] dark:hover:bg-neutral-200 active:scale-98 text-white dark:text-[#0A0A0A] text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Criar tarefa
            </button>
          </div>
        )}

        {scheduledTasks.length > 0 && (
          <div className="flex flex-col gap-2">
            {scheduledTasks.map((task, idx) => (
              <React.Fragment key={task.id}>
                {idx === nowLineIndex && nowLine}
                {renderTask(task)}
              </React.Fragment>
            ))}
            {nowLineIndex === scheduledTasks.length && nowLine}
          </div>
        )}

        {unScheduledTasks.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#737373] dark:text-neutral-400 uppercase tracking-wider px-1">
              Sem horário
            </span>
            {unScheduledTasks.map(renderTask)}
          </div>
        )}
      </div>
    </div>
  );
};
