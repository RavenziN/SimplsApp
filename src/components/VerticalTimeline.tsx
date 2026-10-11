import React, { useRef, useEffect, useState } from 'react';
import {
  Check,
  MoreVertical,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  Utensils,
  Dumbbell,
  Briefcase,
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
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

  // Get matching icon for category
  const getCategoryIcon = (category?: string, title?: string) => {
    const text = `${category || ''} ${title || ''}`.toLowerCase();
    if (text.includes('saúde') || text.includes('academia') || text.includes('treino')) {
      return <Dumbbell className="w-5 h-5 text-white dark:text-[#0A0A0A] -rotate-45" />;
    }
    if (text.includes('reunião') || text.includes('call') || text.includes('zoom')) {
      return <Video className="w-5 h-5 text-white dark:text-[#0A0A0A] -rotate-45" />;
    }
    if (text.includes('almoço') || text.includes('jantar') || text.includes('refeição')) {
      return <Utensils className="w-5 h-5 text-white dark:text-[#0A0A0A] -rotate-45" />;
    }
    if (text.includes('trabalho') || text.includes('mercado') || text.includes('projeto') || text.includes('design')) {
      return <Briefcase className="w-5 h-5 text-white dark:text-[#0A0A0A] -rotate-45" />;
    }
    if (text.includes('livro') || text.includes('leitura') || text.includes('estudos')) {
      return <BookOpen className="w-5 h-5 text-white dark:text-[#0A0A0A] -rotate-45" />;
    }
    return <Check className="w-5 h-5 text-white dark:text-[#0A0A0A] -rotate-45 stroke-[2.5]" />;
  };

  // Compute status and completion percentage for a task
  const getTaskStatusInfo = (task: Task) => {
    if (task.status === 'completed') {
      return {
        label: 'Concluída',
        percentage: 100,
        badgeStyle: 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]',
      };
    }

    if (isSelectedToday) {
      const start = timeStringToMinutes(task.startTime);
      const end = timeStringToMinutes(task.endTime);
      if (nowMinutes >= start && nowMinutes <= end) {
        const progress = Math.min(100, Math.max(10, Math.round(((nowMinutes - start) / (end - start)) * 100)));
        return {
          label: 'Em andamento',
          percentage: progress,
          badgeStyle: 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]',
        };
      }
      if (nowMinutes > end) {
        return {
          label: 'Atrasada',
          percentage: 0,
          badgeStyle: 'bg-[#F7F7F7] dark:bg-[#141414] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#262626]',
        };
      }
    }

    return {
      label: 'Pendente',
      percentage: 0,
      badgeStyle: 'bg-[#F7F7F7] dark:bg-[#141414] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#262626]',
    };
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto bg-white dark:bg-[#0A0A0A] relative pb-28 select-none text-[#0A0A0A] dark:text-white"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
        {/* Unscheduled tasks ("Sem horário") section */}
        {unScheduledTasks.length > 0 && (
          <div className="mb-6 p-4 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
                Sem horário ({unScheduledTasks.length})
              </span>
            </div>
            <div className="space-y-2.5">
              {unScheduledTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskDetails(task)}
                  className={`p-3.5 bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#0A0A0A] dark:hover:border-white transition-all group ${
                    task.status === 'completed' ? 'opacity-60 bg-neutral-50 dark:bg-neutral-900/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task);
                      }}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white text-white dark:text-[#0A0A0A]'
                          : 'border-[#737373] dark:border-neutral-500 hover:border-[#0A0A0A] dark:hover:border-white'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-semibold text-[#0A0A0A] dark:text-white ${
                          task.status === 'completed' ? 'line-through text-[#737373] dark:text-neutral-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.category && (
                        <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">{task.category}</p>
                      )}
                    </div>
                  </div>

                  <div className="relative task-menu-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                      }}
                      className="p-1 text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white rounded-lg cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuTaskId === task.id && (
                      <div className="absolute right-0 top-6 z-50 w-44 bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-xl shadow-lg py-1 text-xs text-[#0A0A0A] dark:text-white">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTaskId(null);
                            onToggleComplete(task);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white font-medium cursor-pointer"
                        >
                          {task.status === 'completed' ? 'Reabrir tarefa' : 'Marcar como concluída'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTaskId(null);
                            onEditTask(task);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white cursor-pointer"
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
                          className="w-full text-left px-3 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white cursor-pointer"
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
                          className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          Excluir tarefa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If completely empty day */}
        {dayTasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F7F7F7] dark:bg-[#141414] flex items-center justify-center text-[#0A0A0A] dark:text-white mb-4">
              <CalendarIcon className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
              Seu dia está livre.
            </h3>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1 max-w-xs">
              Adicione uma tarefa para começar a organizar sua rotina.
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
        ) : null}

        {/* Vertical Timeline with Dashed Connectors matching reference layout */}
        {scheduledTasks.length > 0 && (
          <div className="space-y-6 relative">
            {scheduledTasks.map((task, idx) => {
              const statusInfo = getTaskStatusInfo(task);
              const icon = getCategoryIcon(task.category, task.title);

              return (
                <div key={task.id} className="flex items-start gap-3 sm:gap-4 group">
                  {/* Left Column: Time Axis with Dashed Guide Line */}
                  <div className="w-14 sm:w-16 shrink-0 flex flex-col items-center pt-2">
                    {/* Start Time */}
                    <span className="text-xs font-bold text-[#0A0A0A] dark:text-white tabular-nums font-mono whitespace-nowrap">
                      {task.startTime}
                    </span>

                    {/* Vertical Dashed Line connecting start to end */}
                    <div className="w-0.5 h-16 sm:h-20 border-l-2 border-dashed border-[#E5E5E5] dark:border-[#262626] my-1.5" />

                    {/* End Time */}
                    <span className="text-[11px] font-medium text-[#737373] dark:text-neutral-400 tabular-nums font-mono whitespace-nowrap">
                      {task.endTime}
                    </span>
                  </div>

                  {/* Right Column: Modern Card with Status Pill, Diamond Icon, Title, and Options */}
                  <div
                    onClick={() => onOpenTaskDetails(task)}
                    className={`flex-1 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-3xl p-4 sm:p-5 shadow-xs hover:border-[#0A0A0A] dark:hover:border-white hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                      task.status === 'completed'
                        ? 'opacity-65 bg-neutral-50/70 dark:bg-neutral-900/40 border-[#E5E5E5] dark:border-[#262626]'
                        : ''
                    }`}
                  >
                    {/* Top Row: Status pill & Progress indicator */}
                    <div className="flex items-center justify-between mb-3.5">
                      {/* Status Tab / Pill */}
                      <span
                        className={`px-3 py-1 text-[11px] font-bold rounded-xl tracking-tight transition-all ${statusInfo.badgeStyle}`}
                      >
                        {statusInfo.label}
                      </span>

                      {/* Progress Line & Percentage */}
                      <div className="flex items-center gap-2">
                        <div className="w-12 sm:w-16 h-1 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0A0A0A] dark:bg-white transition-all rounded-full"
                            style={{ width: `${statusInfo.percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#0A0A0A] dark:text-white tabular-nums font-mono">
                          {statusInfo.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Main Card Content Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Iconic Rotated Squircle / Diamond Badge from reference */}
                        <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center rotate-45 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                          {icon}
                        </div>

                        {/* Title and Subtitle / Context */}
                        <div className="min-w-0 pl-1">
                          <h4
                            className={`text-base sm:text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white truncate ${
                              task.status === 'completed'
                                ? 'line-through text-[#737373] dark:text-neutral-500'
                                : ''
                            }`}
                          >
                            {task.title}
                          </h4>
                          <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5 truncate font-medium">
                            {task.category ? `${task.category} · ` : ''}
                            {task.description || `${task.startTime} – ${task.endTime}`}
                          </p>
                        </div>
                      </div>

                      {/* Right Controls: Quick toggle check & 3-dots Menu */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task);
                          }}
                          aria-label={
                            task.status === 'completed'
                              ? 'Reabrir tarefa'
                              : 'Concluir tarefa'
                          }
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                            task.status === 'completed'
                              ? 'bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white text-white dark:text-[#0A0A0A]'
                              : 'border-[#E5E5E5] dark:border-neutral-600 hover:border-[#0A0A0A] dark:hover:border-white bg-white dark:bg-[#1F1F1F]'
                          }`}
                        >
                          {task.status === 'completed' ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <Circle className="w-3 h-3 text-[#E5E5E5] dark:text-neutral-600" />
                          )}
                        </button>

                        <div className="relative task-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuTaskId(
                                activeMenuTaskId === task.id ? null : task.id
                              );
                            }}
                            aria-label="Opções"
                            className="p-1.5 rounded-lg text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuTaskId === task.id && (
                            <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-xl py-1.5 text-xs text-[#0A0A0A] dark:text-white">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuTaskId(null);
                                  onToggleComplete(task);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white font-semibold cursor-pointer"
                              >
                                {task.status === 'completed'
                                  ? 'Reabrir tarefa'
                                  : 'Marcar como concluída'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuTaskId(null);
                                  onEditTask(task);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white cursor-pointer"
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
                                className="w-full text-left px-3.5 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white cursor-pointer"
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Add Slot Bar at the bottom of the timeline */}
        <div className="mt-8 pt-4 border-t border-dashed border-[#E5E5E5] dark:border-[#262626]">
          <button
            type="button"
            onClick={onOpenNewTask}
            className="w-full py-4 border-2 border-dashed border-[#E5E5E5] dark:border-[#262626] hover:border-[#0A0A0A] dark:hover:border-white rounded-3xl flex items-center justify-center gap-2 text-xs font-bold text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white transition-all cursor-pointer group bg-white dark:bg-[#141414] hover:bg-[#F7F7F7] dark:hover:bg-[#1F1F1F]"
          >
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
            Adicionar novo compromisso
          </button>
        </div>
      </div>
    </div>
  );
};
